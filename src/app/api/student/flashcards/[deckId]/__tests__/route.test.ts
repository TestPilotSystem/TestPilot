import { GET, DELETE } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    flashcardDeck: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/student/flashcards/deck-1" }) as unknown as Request;

const mockParams = (deckId: string) =>
  ({ params: Promise.resolve({ deckId }) }) as { params: Promise<{ deckId: string }> };

describe("GET /api/student/flashcards/[deckId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await GET(mockRequest(), mockParams("deck-1"));
    expect(res.status).toBe(401);
  });

  it("should return the deck with its cards", async () => {
    const deck = { id: "deck-1", name: "Señales", cards: [{ id: "c1" }] };
    (prisma.flashcardDeck.findFirst as jest.Mock).mockResolvedValue(deck);

    const res = await GET(mockRequest(), mockParams("deck-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("deck-1");
    expect(prisma.flashcardDeck.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "deck-1", userId: 1 } })
    );
  });

  it("should return 404 if deck not found", async () => {
    (prisma.flashcardDeck.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await GET(mockRequest(), mockParams("deck-99"));
    expect(res.status).toBe(404);
  });

  it("should return 500 on database error", async () => {
    (prisma.flashcardDeck.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await GET(mockRequest(), mockParams("deck-1"));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/student/flashcards/[deckId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await DELETE(mockRequest(), mockParams("deck-1"));
    expect(res.status).toBe(401);
  });

  it("should return 404 if deck not found", async () => {
    (prisma.flashcardDeck.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await DELETE(mockRequest(), mockParams("deck-99"));
    expect(res.status).toBe(404);
  });

  it("should delete the deck and return 200", async () => {
    (prisma.flashcardDeck.findFirst as jest.Mock).mockResolvedValue({ id: "deck-1" });
    (prisma.flashcardDeck.delete as jest.Mock).mockResolvedValue({});

    const res = await DELETE(mockRequest(), mockParams("deck-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Batería eliminada");
    expect(prisma.flashcardDeck.delete).toHaveBeenCalledWith({ where: { id: "deck-1" } });
  });

  it("should return 500 on database error", async () => {
    (prisma.flashcardDeck.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await DELETE(mockRequest(), mockParams("deck-1"));
    expect(res.status).toBe(500);
  });
});
