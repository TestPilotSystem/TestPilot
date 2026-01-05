import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      findUnique: jest.fn(),
    },
    userTest: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

describe("POST /api/student/driving-tests/submit", () => {
  const USER_ID = "1";
  const TEST_ID = "test-123";

  const mockTest = {
    id: TEST_ID,
    questions: [
      { id: "q1", respuestaCorrecta: "A" },
      { id: "q2", respuestaCorrecta: "B" },
    ],
  };

  const mockResponses = {
    q1: "A",
    q2: "C",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authGuard fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });

    const mockRequest = {
      json: async () => ({ testId: TEST_ID, responses: {} }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it("should calculate score correctly and create userTest record", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: USER_ID } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(mockTest);
    (prisma.userTest.create as jest.Mock).mockResolvedValue({
      id: "ut-1",
      score: 50,
    });

    const mockRequest = {
      json: async () => ({ testId: TEST_ID, responses: mockResponses }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.score).toBe(50);
    expect(prisma.userTest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: Number(USER_ID),
        testId: TEST_ID,
        score: 50,
        completed: true,
        responses: {
          create: [
            { questionId: "q1", respuestaDada: "A", esCorrecta: true },
            { questionId: "q2", respuestaDada: "C", esCorrecta: false },
          ],
        },
      }),
    });
  });

  it("should handle case-insensitive answers and trim whitespace", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: USER_ID } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(mockTest);
    (prisma.userTest.create as jest.Mock).mockResolvedValue({
      id: "ut-1",
      score: 100,
    });

    const mockRequest = {
      json: async () => ({
        testId: TEST_ID,
        responses: { q1: " a ", q2: "B" },
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.score).toBe(100);
  });

  it("should return 404 if the test does not exist", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: USER_ID } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      json: async () => ({ testId: "invalid", responses: {} }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(404);
  });

  it("should return 500 if prisma create fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: USER_ID } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(mockTest);
    (prisma.userTest.create as jest.Mock).mockRejectedValue(
      new Error("DB Error")
    );

    const mockRequest = {
      json: async () => ({ testId: TEST_ID, responses: {} }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
  });
});
