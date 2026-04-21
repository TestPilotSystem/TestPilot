import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    flashcardDeck: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/student/flashcards" }) as unknown as Request;

describe("GET /api/student/flashcards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await GET(mockRequest());
    expect(res.status).toBe(401);
  });

  it("should return the list of decks for the user", async () => {
    const decks = [
      { id: "deck-1", name: "Señales", topicName: "Señales", _count: { cards: 10 } },
      { id: "deck-2", name: "Normas", topicName: "Normas", _count: { cards: 5 } },
    ];
    (prisma.flashcardDeck.findMany as jest.Mock).mockResolvedValue(decks);

    const res = await GET(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(prisma.flashcardDeck.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });

  it("should return an empty array when the user has no decks", async () => {
    (prisma.flashcardDeck.findMany as jest.Mock).mockResolvedValue([]);
    const res = await GET(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return 500 on database error", async () => {
    (prisma.flashcardDeck.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await GET(mockRequest());
    expect(res.status).toBe(500);
  });
});
