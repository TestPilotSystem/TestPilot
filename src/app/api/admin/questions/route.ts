import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { testId, enunciado, opciones, respuestaCorrecta, explicacion } =
      body;

    const newQuestion = await prisma.question.create({
      data: {
        testId,
        enunciado,
        opciones,
        respuestaCorrecta,
        explicacion,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear la pregunta" },
      { status: 500 }
    );
  }
}
