import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const userId = Number(auth.payload.id);

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting notifications:", error);
    return NextResponse.json(
      { message: "Error al contar notificaciones" },
      { status: 500 }
    );
  }
}
