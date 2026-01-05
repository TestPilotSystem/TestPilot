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
      topic: { name: "Seguridad Vial" },
      _count: { questions: 30 },
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authGuard fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });

    const request = {} as Request;
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("No autorizado");
    expect(prisma.test.findMany).not.toHaveBeenCalled();
  });

  it("should return 200 and the tests if authorized", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockResolvedValue(mockTests);

    const request = {} as Request;
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].topic.name).toBe("Seguridad Vial");
    expect(prisma.test.findMany).toHaveBeenCalledWith({
      include: {
        topic: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should return 500 if prisma fails", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.test.findMany as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const request = {} as Request;
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error al obtener los tests");
  });
});
