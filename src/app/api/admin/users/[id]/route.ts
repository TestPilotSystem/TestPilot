import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID de usuario no válido" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { message: "Error al eliminar el usuario de la base de datos" },
      { status: 500 }
    );
  }
}
