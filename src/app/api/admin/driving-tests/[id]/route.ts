import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

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

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await prisma.test.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Test eliminado correctamente" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el test" },
      { status: 500 }
    );
  }
}
