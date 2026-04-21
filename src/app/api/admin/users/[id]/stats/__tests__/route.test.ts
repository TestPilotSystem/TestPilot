import { GET } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    userTest: { findMany: jest.fn() },
  },
}));

const mockParams = (id: string) =>
  ({ params: Promise.resolve({ id }) }) as { params: Promise<{ id: string }> };

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/admin/users/1/stats" }) as unknown as Request;

const mockUser = {
  id: 1,
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@test.com",
  dni: "12345678A",
  createdAt: new Date(),
};

const makeUserTest = (score: number | null, topicId = "topic-1", topicName = "Señales") => ({
  score,
  timeSpentSeconds: 120,
  completedAt: new Date(),
  test: { topicId, topic: { name: topicName } },
});

describe("GET /api/admin/users/[id]/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 400 for invalid user id", async () => {
    const res = await GET(mockRequest(), mockParams("abc"));
    expect(res.status).toBe(400);
  });

  it("should return 404 if user not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.userTest.findMany as jest.Mock).mockResolvedValue([]);
    const res = await GET(mockRequest(), mockParams("99"));
    expect(res.status).toBe(404);
  });

  it("should return stats for a user with no completed tests", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.userTest.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET(mockRequest(), mockParams("1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalTests).toBe(0);
    expect(body.averageScore).toBe(0);
    expect(body.bestTopic).toBeNull();
    expect(body.worstTopic).toBeNull();
  });

  it("should return correct aggregated stats", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.userTest.findMany as jest.Mock)
      .mockResolvedValueOnce([
        makeUserTest(80, "topic-1", "Señales"),
        makeUserTest(60, "topic-2", "Normas"),
        makeUserTest(90, "topic-1", "Señales"),
      ])
      .mockResolvedValueOnce([{ score: 70 }, { score: 80 }]);

    const res = await GET(mockRequest(), mockParams("1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalTests).toBe(3);
    expect(body.averageScore).toBe(77);
    expect(body.bestTopic.topicId).toBe("topic-1");
    expect(body.worstTopic.topicId).toBe("topic-2");
    expect(body.classAverageScore).toBe(75);
  });

  it("should return 500 on database error", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await GET(mockRequest(), mockParams("1"));
    expect(res.status).toBe(500);
  });
});
