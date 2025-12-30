import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { enunciado, opciones, respuestaCorrecta, explicacion } = body;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        enunciado,
        opciones,
        respuestaCorrecta,
        explicacion,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar la pregunta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pregunta eliminada" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar la pregunta" },
      { status: 500 }
    );
  }
}
