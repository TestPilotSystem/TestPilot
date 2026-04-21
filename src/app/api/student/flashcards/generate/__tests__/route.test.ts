import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";
import { getAiToken } from "@/lib/aiTokenCache";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    flashcardDeck: { create: jest.fn() },
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

global.fetch = jest.fn();

const mockRequest = (body: object): Request =>
  ({ json: async () => body }) as unknown as Request;

const mockUser = { firstName: "Juan", lastName: "Pérez", dni: "12345678A" };

describe("POST /api/student/flashcards/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (getAiToken as jest.Mock).mockResolvedValue("ai-token-123");
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await POST(mockRequest({ name: "Deck", topicName: "Señales" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 if name or topicName is missing", async () => {
    const res = await POST(mockRequest({ name: "", topicName: "Señales" }));
    expect(res.status).toBe(400);
  });

  it("should return 400 if user has no DNI", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, dni: null });
    const res = await POST(mockRequest({ name: "Deck", topicName: "Señales" }));
    expect(res.status).toBe(400);
  });

  it("should return 429 when AI service rate limits", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429 });
    const res = await POST(mockRequest({ name: "Deck", topicName: "Señales" }));
    expect(res.status).toBe(429);
  });

  it("should return 502 if AI returns no valid flashcards", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ flashcards: [] }),
    });
    const res = await POST(mockRequest({ name: "Deck", topicName: "Señales" }));
    expect(res.status).toBe(502);
  });

  it("should create the deck and return 200 with array response", async () => {
    const cards = [
      { pregunta: "¿Q1?", respuesta: "A1", explicacion: "Exp1" },
      { pregunta: "¿Q2?", respuesta: "A2", explicacion: "Exp2" },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => cards,
    });
    const createdDeck = { id: "deck-1", name: "Deck", _count: { cards: 2 } };
    (prisma.flashcardDeck.create as jest.Mock).mockResolvedValue(createdDeck);

    const res = await POST(mockRequest({ name: "Deck", topicName: "Señales" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.deck.id).toBe("deck-1");
    expect(body.message).toContain("2 flashcards");
  });

  it("should create the deck and return 200 with object response", async () => {
    const cards = [{ pregunta: "¿Q1?", respuesta: "A1", explicacion: "Exp1" }];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ flashcards: cards }),
    });
    (prisma.flashcardDeck.create as jest.Mock).mockResolvedValue({
      id: "deck-2",
      name: "Deck",
      _count: { cards: 1 },
    });

    const res = await POST(mockRequest({ name: "Deck", topicName: "Normas" }));
    expect(res.status).toBe(200);
  });

  it("should return 500 on unexpected error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    const res = await POST(mockRequest({ name: "Deck", topicName: "Señales" }));
    expect(res.status).toBe(500);
  });
});
