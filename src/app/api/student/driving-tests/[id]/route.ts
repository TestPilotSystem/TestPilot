import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(request as any);
  if (auth.error) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

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
        { message: "Test no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
