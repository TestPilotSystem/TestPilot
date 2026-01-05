import { GET } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    topic: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/admin/topics", () => {
  const mockTopics = [
    { id: "1", name: "Tema 10" },
    { id: "2", name: "Tema 2" },
    { id: "3", name: "Tema 1" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return topics sorted naturally (1, 2, 10)", async () => {
    (prisma.topic.findMany as jest.Mock).mockResolvedValue(mockTopics);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[0].name).toBe("Tema 1");
    expect(body[1].name).toBe("Tema 2");
    expect(body[2].name).toBe("Tema 10");
    expect(prisma.topic.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    });
  });

  it("should return an empty array if no topics exist", async () => {
    (prisma.topic.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return 500 if prisma fails", async () => {
    (prisma.topic.findMany as jest.Mock).mockRejectedValue(
      new Error("DB Error")
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Error al obtener temas");
  });
});
