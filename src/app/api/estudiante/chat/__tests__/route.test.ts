import { POST, GET, DELETE } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    chatConfig: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "valid-token" })),
  })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ id: "1" })),
}));

global.fetch = jest.fn();

describe("Chat Tutor Route /api/estudiante/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.chatConfig.findUnique as jest.Mock).mockResolvedValue({
      tone: "formal",
      useStudentNames: false,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      firstName: "Juan",
    });
    (prisma.chatMessage.create as jest.Mock).mockResolvedValue({});
    (prisma.chatMessage.findMany as jest.Mock).mockResolvedValue([]);
  });

  describe("GET", () => {
    it("should return chat history", async () => {
      (prisma.chatMessage.findMany as jest.Mock).mockResolvedValue([
        { role: "user", content: "Hola" },
        { role: "assistant", content: "¡Hola!" },
      ]);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.messages).toHaveLength(2);
    });
  });

  describe("POST", () => {
    it("should return 200 and data when AI responds successfully", async () => {
      const mockResponse = { response: "Esta es la respuesta del tutor" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const mockRequest = {
        json: async () => ({ question: "¿Qué es una rotonda?" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.response).toBe("Esta es la respuesta del tutor");
      expect(prisma.chatMessage.create).toHaveBeenCalledTimes(2);
    });

    it("should return 400 if question is missing", async () => {
      const mockRequest = {
        json: async () => ({ topic: "señales" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("El campo 'question' es requerido");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return 500 if AI API returns error status", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const mockRequest = {
        json: async () => ({ question: "¿Qué es un STOP?" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al comunicarse con el tutor IA");
    });

    it("should return 500 if there is a network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Fail"));

      const mockRequest = {
        json: async () => ({ question: "¿Qué es un STOP?" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al comunicarse con el tutor IA");
    });
  });

  describe("DELETE", () => {
    it("should clear chat history", async () => {
      (prisma.chatMessage.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const response = await DELETE();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Historial borrado");
    });
  });
});
