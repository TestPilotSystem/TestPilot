import { GET } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: jest.fn() },
    userTest: { findMany: jest.fn() },
  },
}));

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/admin/seguimiento" }) as unknown as Request;

const makeUserTest = (
  userId: number,
  score: number | null,
  completedAt: Date,
  topicId = "topic-1",
  topicName = "Señales"
) => ({
  userId,
  score,
  timeSpentSeconds: 60,
  completedAt,
  test: { topicId, topic: { name: topicName } },
});

describe("GET /api/admin/seguimiento", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 200 with empty metrics when no data exists", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.userTest.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalStudents).toBe(0);
    expect(body.activeStudents).toBe(0);
    expect(body.globalAverageScore).toBe(0);
  });

  it("should return correct student counts and averages", async () => {
    const now = new Date();
    const recentDate = new Date(now);
    recentDate.setDate(recentDate.getDate() - 5);

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: 1, firstName: "Juan", lastName: "P", createdAt: now },
      { id: 2, firstName: "Ana", lastName: "G", createdAt: now },
    ]);

    (prisma.userTest.findMany as jest.Mock).mockResolvedValue([
      makeUserTest(1, 80, recentDate),
      makeUserTest(1, 60, recentDate),
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalStudents).toBe(2);
    expect(body.activeStudents).toBe(1);
    expect(body.inactiveStudents).toBe(1);
    expect(body.globalAverageScore).toBe(70);
    expect(body.totalTestsCompleted).toBe(2);
  });

  it("should build score distribution correctly", async () => {
    const now = new Date();
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: 1, firstName: "A", lastName: "B", createdAt: now }]);
    (prisma.userTest.findMany as jest.Mock).mockResolvedValue([
      makeUserTest(1, 20, now),
      makeUserTest(1, 40, now),
      makeUserTest(1, 95, now),
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.scoreDistribution[0].count).toBe(1); // 0-30%
    expect(body.scoreDistribution[1].count).toBe(1); // 30-50%
    expect(body.scoreDistribution[4].count).toBe(1); // 90-100%
  });

  it("should return 500 on database error", async () => {
    (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
