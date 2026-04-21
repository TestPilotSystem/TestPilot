import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";
import { getAiToken } from "@/lib/aiTokenCache";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    userTest: { findMany: jest.fn() },
    test: { deleteMany: jest.fn(), create: jest.fn() },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

jest.mock("@/lib/aiTokenCache", () => ({
  getAiToken: jest.fn(),
}));

jest.mock("@/lib/config", () => ({
  config: { ai: { baseUrl: "http://ai-service" } },
}));

jest.mock("@/lib/notifications", () => ({
  createNotification: jest.fn(),
}));

global.fetch = jest.fn();

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/student/custom-tests/generate" }) as unknown as Request;

const mockUser = { firstName: "Juan", lastName: "Pérez", dni: "12345678A" };

const validPreguntas = [
  {
    pregunta: "¿Q1?",
    opciones: ["Op A", "Op B", "Op C", "Op D"],
    respuesta_correcta: "a",
    explicacion: "Exp1",
  },
  {
    pregunta: "¿Q2?",
    opciones: ["Op A", "Op B", "Op C", "Op D"],
    respuesta_correcta: "b",
    explicacion: "Exp2",
  },
];

describe("POST /api/student/custom-tests/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.userTest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.test.deleteMany as jest.Mock).mockResolvedValue({});
    (getAiToken as jest.Mock).mockResolvedValue("ai-token");
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await POST(mockRequest());
    expect(res.status).toBe(401);
  });

  it("should return 400 if user has no DNI", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, dni: null });
    const res = await POST(mockRequest());
    expect(res.status).toBe(400);
  });

  it("should return 400 if user not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await POST(mockRequest());
    expect(res.status).toBe(400);
  });

  it("should return 429 when AI service rate limits", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429 });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
    const res = await POST(mockRequest());
    expect(res.status).toBe(429);
  });

  it("should return 502 if AI returns no valid preguntas", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ preguntas: [] }),
    });
    const res = await POST(mockRequest());
    expect(res.status).toBe(502);
  });

  it("should create the custom test and return 200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ preguntas: validPreguntas }),
    });
    const createdTest = { id: "custom-1", name: "Test Personalizado IA", _count: { questions: 2 } };
    (prisma.test.create as jest.Mock).mockResolvedValue(createdTest);

    const res = await POST(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.customTest.id).toBe("custom-1");
    expect(body.message).toContain("2 preguntas");
    expect(prisma.test.deleteMany).toHaveBeenCalled();
  });

  it("should return 500 on unexpected error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    const res = await POST(mockRequest());
    expect(res.status).toBe(500);
  });
});
