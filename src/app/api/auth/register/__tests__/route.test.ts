import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

jest.mock("@/lib/prisma", () => {
  const mockInternalPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    request: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockInternalPrisma)),
  };

  return {
    prisma: mockInternalPrisma,
  };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("POST /api/auth/register", () => {
  const VALID_DATA = {
    dni: "12345678Z",
    firstName: "Jesús",
    lastName: "García",
    email: "jesus@example.com",
    dateOfBirth: "1995-05-15",
    password: "Password123*",
    confirmPassword: "Password123*",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201, create user and create a pending request", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1 });

    const mockRequest = {
      json: async () => VALID_DATA,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toContain("Solicitud de registro enviada con éxito");

    expect(prisma.$transaction).toHaveBeenCalled();

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: VALID_DATA.email,
          role: "STUDENT",
        }),
      })
    );

    expect(prisma.request.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 1,
          status: "PENDING",
        }),
      })
    );
  });

  it("should return 400 if email or DNI already exists", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "existing-id",
    });

    const mockRequest = {
      json: async () => VALID_DATA,
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return 500 if the transaction fails", async () => {
    // Mute console.error to avoid cluttering test output
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB Error"));

    const mockRequest = { json: async () => VALID_DATA } as unknown as Request;
    const response = await POST(mockRequest);

    expect(response.status).toBe(500);

    // Restore console.error
    consoleSpy.mockRestore();
  });
});
