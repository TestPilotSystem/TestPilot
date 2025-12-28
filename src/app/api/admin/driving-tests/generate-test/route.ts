import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Extra security check for admin role
    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    const { topicId, topicName, numQuestions } = await req.json();

    const response = await fetch(
      `http://127.0.0.1:8000/admin/ai/generate-full-test?topic=${encodeURIComponent(
        topicName
      )}&num_questions=${numQuestions}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener el test de la IA");
    }

    const data = await response.json();

    const newTest = await prisma.test.create({
      data: {
        topicId: topicId,
        questions: {
          create: data.test.map((q: any) => ({
            enunciado: q.pregunta,
            opciones: q.opciones,
            respuestaCorrecta: q.respuesta_correcta,
            explicacion: q.explicacion,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      message: "Test generado con éxito en el repositorio global",
      testId: newTest.id,
    });
  } catch (error: any) {
    console.error("Error en create-test:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
