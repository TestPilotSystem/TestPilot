import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      findUnique: jest.fn(),
    },
    question: {
      findMany: jest.fn(),
    },
    userResponse: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

const mockRequest = (body: object): Request =>
  ({ json: async () => body }) as unknown as Request;

const mockTest = {
  id: "test-1",
  type: "ERROR",
  userId: 1,
  questions: [
    { id: "q1", enunciado: "¿Pregunta 1?", respuestaCorrecta: "a" },
    { id: "q2", enunciado: "¿Pregunta 2?", respuestaCorrecta: "b" },
  ],
};

describe("POST /api/student/error-tests/submit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(mockTest);
    (prisma.question.findMany as jest.Mock).mockResolvedValue([{ id: "q1" }]);
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue([{ id: "r1" }]);
    (prisma.userResponse.updateMany as jest.Mock).mockResolvedValue({});
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await POST(mockRequest({ testId: "test-1", responses: [] }));
    expect(res.status).toBe(401);
  });

  it("should return 400 if test is not found", async () => {
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await POST(mockRequest({ testId: "bad-id", responses: [] }));
    expect(res.status).toBe(400);
  });

  it("should return 403 if test belongs to another user", async () => {
    (prisma.test.findUnique as jest.Mock).mockResolvedValue({ ...mockTest, userId: 99 });
    const res = await POST(mockRequest({ testId: "test-1", responses: [] }));
    expect(res.status).toBe(403);
  });

  it("should process array of responses and return results", async () => {
    const responses = [
      { questionId: "q1", answer: "a" },
      { questionId: "q2", answer: "c" },
    ];

    const res = await POST(mockRequest({ testId: "test-1", responses }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.correctCount).toBe(1);
    expect(body.totalQuestions).toBe(2);
  });

  it("should accept responses as an object map", async () => {
    const responses = { q1: "a", q2: "c" };

    const res = await POST(mockRequest({ testId: "test-1", responses }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.correctCount).toBe(1);
  });

  it("should rectify past failures on correct answers", async () => {
    const responses = [{ questionId: "q1", answer: "a" }];
    (prisma.userResponse.findMany as jest.Mock).mockResolvedValue([{ id: "r1" }, { id: "r2" }]);

    const res = await POST(mockRequest({ testId: "test-1", responses }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(prisma.userResponse.updateMany).toHaveBeenCalled();
    expect(body.rectifiedCount).toBe(2);
  });

  it("should return 500 on unexpected error", async () => {
    (prisma.test.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await POST(mockRequest({ testId: "test-1", responses: [] }));
    expect(res.status).toBe(500);
  });
});
