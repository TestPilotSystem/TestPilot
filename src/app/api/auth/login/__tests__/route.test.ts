import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "../route";
import { cookies } from "next/headers";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetAttempts,
} from "@/lib/loginRateLimiter";

jest.mock("next/headers", () => {
  const cookieStore = {
    set: jest.fn(),
    get: jest.fn(),
  };
  return {
    cookies: jest.fn(async () => cookieStore),
  };
});

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked_jwt_token"),
}));

jest.mock("@/lib/loginRateLimiter", () => ({
  checkRateLimit: jest.fn(),
  recordFailedAttempt: jest.fn(),
  resetAttempts: jest.fn(),
}));

describe("POST /api/auth/login", () => {
  const VALID_EMAIL = "test@example.com";
  const VALID_PASSWORD = "Password123*";
  const HASHED_PASSWORD = "hashed_password";

  const mockUser = {
    id: 1,
    email: VALID_EMAIL,
    password: HASHED_PASSWORD,
    role: "STUDENT",
    firstName: "Test",
    lastName: "User",
    mustChangePassword: false,
    requests: [{ status: "APPROVED", adminNotes: null }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: not rate limited
    (checkRateLimit as jest.Mock).mockReturnValue({ blocked: false, attemptsRemaining: 5 });
    (recordFailedAttempt as jest.Mock).mockReturnValue({ locked: false, attemptsRemaining: 4 });
  });

  it("should return a 401 status for invalid credentials (email not found)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      json: async () => ({
        email: "nonexistent@example.com",
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Credenciales inválidas");
    expect(body.attemptsRemaining).toBe(4);
    expect(recordFailedAttempt).toHaveBeenCalledWith("nonexistent@example.com");
  });

  it("should return 429 when account is already rate limited (checked before DB)", async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({
      blocked: true,
      secondsRemaining: 45,
      message: "Cuenta bloqueada. Intenta de nuevo en 45 segundos.",
    });

    const mockRequest = {
      json: async () => ({ email: VALID_EMAIL, password: VALID_PASSWORD }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.message).toContain("45 segundos");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("should return 429 and lockout message when max attempts are reached", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (recordFailedAttempt as jest.Mock).mockReturnValue({
      locked: true,
      secondsRemaining: 60,
      message: "Demasiados intentos fallidos. Cuenta bloqueada durante 1 minuto.",
    });

    const mockRequest = {
      json: async () => ({ email: VALID_EMAIL, password: "wrong" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.message).toContain("1 minuto");
  });

  it("should return a 403 status if a STUDENT has a PENDING request", async () => {
    const mockPendingStudent = {
      ...mockUser,
      requests: [{ status: "PENDING" }],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockPendingStudent);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe(
      "Tu solicitud de acceso aún está pendiente de aprobación."
    );
  });

  it("should return a 403 status if a STUDENT has a REJECTED request", async () => {
    const mockRejectedStudent = {
      ...mockUser,
      requests: [{ status: "REJECTED", adminNotes: "Falta DNI" }],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(
      mockRejectedStudent
    );
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toContain(
      "Tu solicitud ha sido rechazada. Motivo: Falta DNI"
    );
  });

  it("should return 200 for ADMIN even if no requests are present (bypass logic)", async () => {
    const mockAdmin = {
      ...mockUser,
      role: "ADMIN",
      requests: [],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });

  it("should return a 200 status and set a cookie for a STUDENT with APPROVED request", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const cookieStore = await cookies();
    expect(cookieStore.set).toHaveBeenCalledWith(
      "auth_token",
      "mocked_jwt_token",
      expect.any(Object)
    );
  });

  it("should reset rate limit on successful login", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({ email: VALID_EMAIL, password: VALID_PASSWORD }),
    } as unknown as Request;

    await POST(mockRequest);
    expect(resetAttempts).toHaveBeenCalledWith(VALID_EMAIL);
  });

  it("should not reset rate limit when login fails", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      json: async () => ({ email: VALID_EMAIL, password: "wrong" }),
    } as unknown as Request;

    await POST(mockRequest);
    expect(resetAttempts).not.toHaveBeenCalled();
  });
});
