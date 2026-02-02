import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  question: string;
  topic?: string;
  tone?: string;
  user_name?: string;
}

async function getUserIdFromToken(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { id: string };
    return parseInt(payload.id);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el historial" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body: ChatRequest = await request.json();

    if (!body.question) {
      return NextResponse.json(
        { error: "El campo 'question' es requerido" },
        { status: 400 }
      );
    }

    const [chatConfig, user] = await Promise.all([
      prisma.chatConfig.findUnique({ where: { id: "default" } }),
      prisma.user.findUnique({ where: { id: userId }, select: { firstName: true } }),
    ]);

    await prisma.chatMessage.create({
      data: {
        userId,
        role: "user",
        content: body.question,
      },
    });

    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { role: true, content: true },
    });

    const history: ChatMessage[] = recentMessages.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const tone = chatConfig?.tone || "formal";
    const userName = chatConfig?.useStudentNames && user?.firstName ? user.firstName : undefined;

    const response = await fetch(`${config.ai.baseUrl}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: body.question,
        history,
        tone,
        ...(userName && { user_name: userName }),
        ...(body.topic && { topic: body.topic }),
      }),
    });

    if (!response.ok) {
      throw new Error("Error en el servicio de IA");
    }

    const data = await response.json();
    const assistantContent =
      data.response || "Lo siento, no he podido procesar tu pregunta.";

    await prisma.chatMessage.create({
      data: {
        userId,
        role: "assistant",
        content: assistantContent,
      },
    });

    return NextResponse.json({ response: assistantContent });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al comunicarse con el tutor IA" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.chatMessage.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ message: "Historial borrado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al borrar el historial" },
      { status: 500 }
    );
  }
}
