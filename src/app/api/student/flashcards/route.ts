import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const userId = Number(auth.payload.id);

    const decks = await prisma.flashcardDeck.findMany({
      where: { userId },
      include: {
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(decks);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Error al obtener flashcards" },
      { status: 500 }
    );
  }
}
