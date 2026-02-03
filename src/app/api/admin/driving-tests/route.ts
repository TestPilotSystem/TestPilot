import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      where: {
        type: "BASIC",
      },
      include: {
        topic: true,
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
      { error: "Error al obtener tests" },
      { status: 500 }
    );
  }
}
