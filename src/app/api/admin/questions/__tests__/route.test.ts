import { POST } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      create: jest.fn(),
    },
  },
}));

describe("POST /api/admin/questions", () => {
  const mockQuestion = {
    testId: "test-123",
    enunciado: "¿Qué significa esta señal?",
    opciones: { A: "Pare", B: "Siga", C: "Ceda el paso" },
    respuestaCorrecta: "C",
    explicacion: "Es una señal de reglamentación.",
  };

  const createdQuestion = {
    id: "question-999",
    ...mockQuestion,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a question successfully and return it with 200 status", async () => {
    (prisma.question.create as jest.Mock).mockResolvedValue(createdQuestion);

    const mockRequest = {
      json: async () => mockQuestion,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(createdQuestion);
    expect(prisma.question.create).toHaveBeenCalledWith({
      data: mockQuestion,
    });
  });

  it("should return a 500 status if prisma fails to create the question", async () => {
    (prisma.question.create as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const mockRequest = {
      json: async () => mockQuestion,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Error al crear la pregunta");
  });

  it("should handle missing optional fields like explicacion", async () => {
    const questionWithoutExplicacion = { ...mockQuestion, explicacion: null };
    (prisma.question.create as jest.Mock).mockResolvedValue({
      id: "q-1",
      ...questionWithoutExplicacion,
    });

    const mockRequest = {
      json: async () => questionWithoutExplicacion,
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.explicacion).toBeNull();
  });
});
