import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { config } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      console.log("❌ No se encontró la cookie auth_token");
      return NextResponse.json(
        { error: "No autorizado: sesión no encontrada" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      console.log("❌ Token inválido o expirado");
      return NextResponse.json(
        { error: "Sesión expirada o inválida" },
        { status: 401 }
      );
    }

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    const { topicId, topicName, numQuestions } = await req.json();

    console.log(`🚀 Llamando a la IA para el tema: ${topicName}`);

    const response = await fetch(
      `${config.ai.baseUrl}/admin/ai/generate-full-test?topic=${encodeURIComponent(
        topicName
      )}&num_questions=${numQuestions}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("La IA de Python ha fallado o está tardando demasiado");
    }

    const data = await response.json();

    const newTest = await prisma.test.create({
      data: {
        topicId: topicId,
        isVisible: false,
        questions: {
          create: data.test.map((q: any) => ({
            enunciado: q.pregunta,
            opciones: q.opciones,
            respuestaCorrecta: q.respuesta_correcta,
            explicacion: q.explicacion,
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Test generado con éxito",
      testId: newTest.id,
    });
  } catch (error: any) {
    console.error("🔥 Error en create-test:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
