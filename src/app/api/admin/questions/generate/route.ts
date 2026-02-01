import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");

    if (!topic) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'topic'" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${config.ai.baseUrl}/admin/ai/generate-question?topic=${encodeURIComponent(topic)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Error en la generación de la IA");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al generar la pregunta con IA" },
      { status: 500 }
    );
  }
}
