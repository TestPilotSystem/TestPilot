import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/student/driving-tests", () => {
  const mockTests = [
    {
      id: "test-1",
      createdAt: new Date(),
      topicId: "topic-1",
      topic: { id: "topic-1", name: "Señales" },
      _count: { questions: 30 },
    },
    {
      id: "test-2",
      createdAt: new Date(),
      topicId: "topic-2",
      topic: { id: "topic-2", name: "Prioridad" },
      _count: { questions: 20 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all tests with topic and questions count successfully", async () => {
    (prisma.test.findMany as jest.Mock).mockResolvedValue(mockTests);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].topic.name).toBe("Señales");
    expect(body[0]._count.questions).toBe(30);
    expect(prisma.test.findMany).toHaveBeenCalledWith({
      include: {
        topic: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        type: "BASIC",
      },
    });
  });

  it("should return an empty array if no tests exist", async () => {
    (prisma.test.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return a 500 status if prisma database fails", async () => {
    (prisma.test.findMany as jest.Mock).mockRejectedValue(
      new Error("Database Error")
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Error al obtener tests");
  });

  it("should verify tests are ordered by createdAt desc", async () => {
    (prisma.test.findMany as jest.Mock).mockResolvedValue(mockTests);

    await GET();

    expect(prisma.test.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  });
});
