import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "../route";
import { cookies } from "next/headers";

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
});
