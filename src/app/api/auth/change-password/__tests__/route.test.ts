import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "../route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("POST /api/auth/change-password", () => {
  const VALID_EMAIL = "test@example.com";
  const VALID_PASSWORD = "ValidPass123*";
  const INVALID_PASSWORD = "wrongpass";
  const NEW_PASSWORD = "NewPass123#";

  const mockUser = {
    id: "user-id-123",
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
    role: "STUDENT",
    status: "ACTIVE",
    firstName: "Test",
    lastName: "User",
    mustChangePassword: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        currentPassword: VALID_PASSWORD,
      }),
    } as unknown as Request;
    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe(
      "Email, current password and new password are required"
    );
  });

  it("should return 401 for invalid email or current password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        currentPassword: INVALID_PASSWORD,
        newPassword: NEW_PASSWORD,
      }),
    } as unknown as Request;
    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Invalid email or current password");
  });

  it("should return 400 if new password is the same as current password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        currentPassword: VALID_PASSWORD,
        newPassword: VALID_PASSWORD,
      }),
    } as unknown as Request;
    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe(
      "New password must be different from current password"
    );
  });

  it("should successfully change the password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword123");
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: "hashedNewPassword123",
    });

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("Password changed successfully");
  });
});
