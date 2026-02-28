import { NextResponse } from "next/server";
import { authGuard } from "@/lib/middleware/guards";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { title, messageBody } = await request.json();

    if (!title?.trim() || !messageBody?.trim()) {
      return NextResponse.json(
        { message: "Se requiere asunto y mensaje" },
        { status: 400 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: Number(auth.payload.id) },
      select: { firstName: true, lastName: true },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const senderName = student
      ? `${student.firstName} ${student.lastName}`
      : "Un alumno";

    await Promise.allSettled(
      admins.map((admin) =>
        createNotification(admin.id, "ADMIN_MESSAGE", {
          messageTitle: `Soporte: ${title.trim()}`,
          messageBody: `De: ${senderName}\n\n${messageBody.trim()}`,
        })
      )
    );

    return NextResponse.json({ message: "Mensaje enviado al soporte" });
  } catch (error) {
    console.error("Error sending support message:", error);
    return NextResponse.json(
      { message: "Error al enviar el mensaje" },
      { status: 500 }
    );
  }
}
