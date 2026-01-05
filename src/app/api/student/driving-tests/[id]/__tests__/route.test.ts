import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

describe("GET /api/student/driving-tests/[id]", () => {
  const TEST_ID = "test-123";
  const mockTest = {
    id: TEST_ID,
    topic: { id: "topic-1", name: "Mecánica" },
    questions: [{ id: "q1", enunciado: "Pregunta 1", respuestaCorrecta: "A" }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authGuard fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });

    const params = Promise.resolve({ id: TEST_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("No autorizado");
    expect(prisma.test.findUnique).not.toHaveBeenCalled();
  });

  it("should return 200 and the test data if authorized and test exists", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(mockTest);

    const params = Promise.resolve({ id: TEST_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(TEST_ID);
    expect(prisma.test.findUnique).toHaveBeenCalledWith({
      where: { id: TEST_ID },
      include: {
        topic: true,
        questions: true,
      },
    });
  });

  it("should return 404 if the test is not found", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findUnique as jest.Mock).mockResolvedValue(null);

    const params = Promise.resolve({ id: "non-existent" });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Test no encontrado");
  });

  it("should return 500 if prisma fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const params = Promise.resolve({ id: TEST_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error del servidor");
  });
});
