import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    userResponse: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/student/error-tests/generate" }) as unknown as Request;

const mockFailedResponses = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    questionId: i + 1,
    question: {
      id: i + 1,
      enunciado: `Pregunta ${i + 1}`,
      opciones: { a: "Op A", b: "Op B" },
      respuestaCorrecta: "a",
      explicacion: "Exp",
    },
  }));

describe("POST /api/student/error-tests/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.deleteMany as jest.Mock).mockResolvedValue({});
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await POST(mockRequest());
    expect(res.status).toBe(401);
  });

  it("should return 200 with empty array if no failed questions", async () => {
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue([]);

    const res = await POST(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.errorTests).toEqual([]);
    expect(body.message).toContain("No tienes errores pendientes");
  });

  it("should create a single error test for <= 20 unique failures", async () => {
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue(
      mockFailedResponses(5)
    );
    const createdTest = { id: "t1", name: "Repaso de Errores", _count: { questions: 5 } };
    (prisma.test.create as jest.Mock).mockResolvedValue(createdTest);

    const res = await POST(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.errorTests).toHaveLength(1);
    expect(prisma.test.create).toHaveBeenCalledTimes(1);
    expect(prisma.test.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Repaso de Errores" }),
      })
    );
  });

  it("should create multiple tests when failures exceed 20", async () => {
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue(
      mockFailedResponses(25)
    );
    (prisma.test.create as jest.Mock)
      .mockResolvedValueOnce({ id: "t1", name: "Repaso de Errores 1", _count: { questions: 20 } })
      .mockResolvedValueOnce({ id: "t2", name: "Repaso de Errores 2", _count: { questions: 5 } });

    const res = await POST(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.errorTests).toHaveLength(2);
    expect(prisma.test.create).toHaveBeenCalledTimes(2);
  });

  it("should deduplicate failed questions", async () => {
    const duplicates = [
      ...mockFailedResponses(3),
      { questionId: 1, question: mockFailedResponses(1)[0].question },
    ];
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue(duplicates);
    (prisma.test.create as jest.Mock).mockResolvedValue({
      id: "t1",
      _count: { questions: 3 },
    });

    await POST(mockRequest());
    expect(prisma.test.create).toHaveBeenCalledTimes(1);
  });

  it("should return 500 on unexpected error", async () => {
    (prisma.userResponse.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await POST(mockRequest());
    expect(res.status).toBe(500);
  });
});
