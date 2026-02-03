import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

describe("GET /api/student/driving-tests", () => {
  const mockTests = [
    {
      id: "test-1",
      topicId: "topic-1",
      topic: { name: "Tema 1" },
      _count: { questions: 5 },
      createdAt: new Date(),
      type: "BASIC",
    },
    {
      id: "test-2",
      topicId: "topic-2",
      topic: { name: "Tema 2" },
      _count: { questions: 10 },
      createdAt: new Date(),
      type: "BASIC",
    },
    {
      id: "test-3",
      topicId: "topic-3",
      topic: { name: "Señales" },
      _count: { questions: 8 },
      createdAt: new Date(),
      type: "BASIC",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authGuard fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });

    const request = new Request("http://localhost/api/student/driving-tests");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("No autorizado");
    expect(prisma.test.findMany).not.toHaveBeenCalled();
  });

  it("should return 200 and all tests with type field when no filters", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue(mockTests);

    const request = new Request("http://localhost/api/student/driving-tests");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body[0]).toHaveProperty("type", "BASIC");
    expect(body[0].topic.name).toBe("Tema 1");
  });

  it("should filter tests by search term (topic name)", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue([mockTests[0]]);

    const request = new Request("http://localhost/api/student/driving-tests?search=tema");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.test.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                // Default filters (BASIC, userId: null) + others...
                expect.objectContaining({ type: "BASIC", userId: null }),
              ]),
            }),
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ topic: { name: { contains: "tema" } } }),
                expect.objectContaining({ name: { contains: "tema" } }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it("should filter tests by type=BASIC", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue(mockTests);

    const request = new Request("http://localhost/api/student/driving-tests?types=BASIC");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(3);
    body.forEach((test: any) => {
      expect(test.type).toBe("BASIC");
    });
  });

  it("should return empty array when filtering by ERROR type (none exist yet)", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost/api/student/driving-tests?types=ERROR");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(0);
  });

  it("should handle combined search and type filters", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue([mockTests[0]]);

    const request = new Request("http://localhost/api/student/driving-tests?search=tema&types=BASIC");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
  });

  it("should ignore invalid type values", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue(mockTests);

    const request = new Request("http://localhost/api/student/driving-tests?types=INVALID,BASIC");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(3);
  });

  it("should return 500 if prisma fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/student/driving-tests");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error al obtener los tests");
  });
});
