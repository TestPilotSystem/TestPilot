import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";
import { config } from "@/lib/config";
import { getAiToken } from "@/lib/aiTokenCache";

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, topicName } = await request.json();

    if (!name || !topicName) {
      return NextResponse.json(
        { message: "El nombre y el tema son obligatorios" },
        { status: 400 }
      );
    }

    const userId = Number(auth.payload.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, dni: true },
    });

    if (!user || !user.dni) {
      return NextResponse.json(
        { message: "El usuario debe tener un DNI registrado" },
        { status: 400 }
      );
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    const aiToken = await getAiToken(userId, fullName, user.dni);

    const generateResponse = await fetch(
      `${config.ai.baseUrl}/flashcard/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": aiToken,
        },
        body: JSON.stringify({ topic: topicName }),
      }
    );

    if (!generateResponse.ok) {
      if (generateResponse.status === 429) {
        return NextResponse.json(
          { message: "Has excedido el límite de generación de flashcards. Inténtalo de nuevo más tarde." },
          { status: 429 }
        );
      }
      const errorData = await generateResponse.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Error al generar flashcards desde el servicio de IA"
      );
    }

    const generatedData = await generateResponse.json();

    let flashcards: any[] | null = null;
    if (Array.isArray(generatedData)) {
      flashcards = generatedData;
    } else if (Array.isArray(generatedData.flashcards)) {
      flashcards = generatedData.flashcards;
    } else if (generatedData.flashcards && typeof generatedData.flashcards === "object") {
      flashcards = Object.values(generatedData.flashcards);
    }

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json(
        { message: "El servicio de IA no generó flashcards válidas" },
        { status: 502 }
      );
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        name,
        topicName,
        userId,
        cards: {
          create: flashcards.map((fc: any) => ({
            pregunta: fc.pregunta,
            respuesta: fc.respuesta,
            explicacion: fc.explicacion,
          })),
        },
      },
      include: {
        _count: { select: { cards: true } },
      },
    });

    return NextResponse.json({
      message: `Batería "${name}" generada con ${flashcards.length} flashcards`,
      deck,
    });
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { message: error.message || "Error al generar flashcards" },
      { status: 500 }
    );
  }
}
