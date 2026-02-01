import { NextResponse } from "next/server";
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
  history?: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.question) {
      return NextResponse.json(
        { error: "El campo 'question' es requerido" },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.ai.baseUrl}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Error en el servicio de IA");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al comunicarse con el tutor IA" },
      { status: 500 }
    );
  }
}
