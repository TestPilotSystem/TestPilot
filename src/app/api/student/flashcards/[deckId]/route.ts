import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { deckId } = await params;
    const userId = Number(auth.payload.id);

    const deck = await prisma.flashcardDeck.findFirst({
      where: { id: deckId, userId },
      include: { cards: true },
    });

    if (!deck) {
      return NextResponse.json(
        { message: "Batería no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(deck);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Error al obtener la batería" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { deckId } = await params;
    const userId = Number(auth.payload.id);

    const deck = await prisma.flashcardDeck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      return NextResponse.json(
        { message: "Batería no encontrada" },
        { status: 404 }
      );
    }

    await prisma.flashcardDeck.delete({ where: { id: deckId } });

    return NextResponse.json({ message: "Batería eliminada" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Error al eliminar la batería" },
      { status: 500 }
    );
  }
}
