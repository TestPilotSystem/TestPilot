import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "../route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

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

  it("should return 201 and success message for valid data", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const mockRequest = {
      json: async () => VALID_DATA,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toContain("Solicitud de registro enviada con éxito");
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it("should return 400 if email or DNI already exists", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "existing-id",
    });

    const mockRequest = {
      json: async () => VALID_DATA,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe(
      "El email o el DNI ya están registrados en la plataforma."
    );
  });

  it("should return 400 if passwords do not match", async () => {
    const invalidData = { ...VALID_DATA, confirmPassword: "wrongPassword" };

    const mockRequest = {
      json: async () => invalidData,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Las contraseñas no coinciden");
  });

  it("should return 400 if DNI format is invalid", async () => {
    const invalidData = { ...VALID_DATA, dni: "12345A" };

    const mockRequest = {
      json: async () => invalidData,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Formato de DNI inválido");
  });

  it("should return 400 if email format is invalid", async () => {
    const invalidData = { ...VALID_DATA, email: "not-an-email" };

    const mockRequest = {
      json: async () => invalidData,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Formato de email inválido");
  });

  it("should return 400 if password is too weak", async () => {
    const invalidData = {
      ...VALID_DATA,
      password: "123",
      confirmPassword: "123",
    };

    const mockRequest = {
      json: async () => invalidData,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("La contraseña debe tener al menos 8 caracteres");
  });
});
