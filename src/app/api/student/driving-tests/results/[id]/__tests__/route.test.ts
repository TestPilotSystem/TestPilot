import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    userTest: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

describe("GET /api/student/driving-tests/results/[id]", () => {
  const RESULT_ID = "result-123";
  const USER_ID = 1;

  const mockResult = {
    id: RESULT_ID,
    userId: USER_ID,
    score: 80,
    test: {
      topic: { name: "Señales" },
    },
    responses: [{ id: "res-1", questionId: "q1", esCorrecta: true }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authGuard fails or payload is missing", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });

    const params = Promise.resolve({ id: RESULT_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("No autorizado");
  });

  it("should return 200 and the result data if authorized and is the owner", async () => {
    (authGuard as jest.Mock).mockResolvedValue({
      payload: { id: USER_ID.toString() },
    });
    (prisma.userTest.findUnique as jest.Mock).mockResolvedValue(mockResult);

    const params = Promise.resolve({ id: RESULT_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(RESULT_ID);
    expect(prisma.userTest.findUnique).toHaveBeenCalledWith({
      where: { id: RESULT_ID },
      include: {
        test: { include: { topic: true } },
        responses: true,
      },
    });
  });

  it("should return 404 if the result belongs to another user", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "999" } });
    (prisma.userTest.findUnique as jest.Mock).mockResolvedValue(mockResult);

    const params = Promise.resolve({ id: RESULT_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Result not found");
  });

  it("should return 404 if the result does not exist", async () => {
    (authGuard as jest.Mock).mockResolvedValue({
      payload: { id: USER_ID.toString() },
    });
    (prisma.userTest.findUnique as jest.Mock).mockResolvedValue(null);

    const params = Promise.resolve({ id: "invalid-id" });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Result not found");
  });

  it("should return 500 if prisma fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({
      payload: { id: USER_ID.toString() },
    });
    (prisma.userTest.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB Error")
    );

    const params = Promise.resolve({ id: RESULT_ID });
    const request = {} as Request;

    const response = await GET(request, { params });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Server error");
  });
});
