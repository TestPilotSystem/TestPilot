import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const tests = await prisma.test.findMany({
      include: {
        topic: {
          select: { name: true },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los tests" },
      { status: 500 }
    );
  }
}
