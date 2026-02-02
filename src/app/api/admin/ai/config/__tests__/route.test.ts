import { GET, PUT } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    chatConfig: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "valid-admin-token" })),
  })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ role: "ADMIN" })),
}));

describe("AI Config Route /api/admin/ai/config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return existing config", async () => {
      (prisma.chatConfig.findUnique as jest.Mock).mockResolvedValue({
        id: "default",
        tone: "informal",
        useStudentNames: true,
      });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tone).toBe("informal");
      expect(body.useStudentNames).toBe(true);
    });

    it("should create default config if none exists", async () => {
      (prisma.chatConfig.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.chatConfig.create as jest.Mock).mockResolvedValue({
        id: "default",
        tone: "formal",
        useStudentNames: false,
      });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tone).toBe("formal");
      expect(prisma.chatConfig.create).toHaveBeenCalled();
    });
  });

  describe("PUT", () => {
    it("should update config successfully", async () => {
      (prisma.chatConfig.upsert as jest.Mock).mockResolvedValue({
        id: "default",
        tone: "detallado",
        useStudentNames: true,
      });

      const mockRequest = {
        json: async () => ({ tone: "detallado", useStudentNames: true }),
      } as unknown as Request;

      const response = await PUT(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tone).toBe("detallado");
      expect(body.useStudentNames).toBe(true);
    });

    it("should return 400 for invalid tone", async () => {
      const mockRequest = {
        json: async () => ({ tone: "invalido" }),
      } as unknown as Request;

      const response = await PUT(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Tono inválido");
    });

    it("should return 400 when conciso and useStudentNames are combined", async () => {
      const mockRequest = {
        json: async () => ({ tone: "conciso", useStudentNames: true }),
      } as unknown as Request;

      const response = await PUT(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Conciso");
      expect(body.error).toContain("no es compatible");
    });
  });
});
