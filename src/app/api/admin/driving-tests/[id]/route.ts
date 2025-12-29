import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        topic: true,
        questions: true,
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el test" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    await prisma.test.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Test eliminado con éxito" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
