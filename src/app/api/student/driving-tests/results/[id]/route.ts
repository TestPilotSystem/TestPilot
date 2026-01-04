import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await prisma.userTest.findUnique({
      where: { id },
      include: {
        test: { include: { topic: true } },
        responses: true,
      },
    });

    if (!result || result.userId !== Number(auth.payload.id)) {
      return NextResponse.json(
        { message: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
