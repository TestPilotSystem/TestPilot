import { GET } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    userTest: { findMany: jest.fn() },
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

jest.mock("@/lib/config", () => ({
  config: { jwt: { secret: "test-secret" } },
}));

const makeUserTest = (
  score: number | null,
  topicId = "topic-1",
  topicName = "Señales",
  timeSpent = 120
) => ({
  score,
  timeSpentSeconds: timeSpent,
  completedAt: new Date(),
  test: { topicId, topic: { name: topicName } },
});

describe("GET /api/estudiante/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 401 if no token", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => undefined) });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should return zero stats when user has no completed tests", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });

    (prisma.userTest.findMany as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalTests).toBe(0);
    expect(body.averageScore).toBe(0);
    expect(body.bestTopic).toBeNull();
    expect(body.worstTopic).toBeNull();
  });

  it("should return aggregated stats correctly", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });

    (prisma.userTest.findMany as jest.Mock)
      .mockResolvedValueOnce([
        makeUserTest(80, "topic-1", "Señales", 100),
        makeUserTest(60, "topic-2", "Normas", 200),
        makeUserTest(90, "topic-1", "Señales", 150),
      ])
      .mockResolvedValueOnce([{ score: 70 }, { score: 90 }]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalTests).toBe(3);
    expect(body.averageScore).toBe(77);
    expect(body.totalTimeSeconds).toBe(450);
    expect(body.bestTopic.topicId).toBe("topic-1");
    expect(body.worstTopic.topicId).toBe("topic-2");
    expect(body.classAverageScore).toBe(80);
    expect(body.testsByTopic).toHaveLength(2);
  });

  it("should return 500 on unexpected error", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });
    (prisma.userTest.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
