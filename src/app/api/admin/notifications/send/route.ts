import { NextResponse } from "next/server";
import { authGuard } from "@/lib/middleware/guards";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload || auth.payload.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userIds, title, messageBody } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: "Se requiere al menos un destinatario" },
        { status: 400 }
      );
    }

    if (!title || !messageBody) {
      return NextResponse.json(
        { message: "Se requiere título y cuerpo del mensaje" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      userIds.map((userId: number) =>
        createNotification(userId, "ADMIN_MESSAGE", {
          messageTitle: title,
          messageBody: messageBody,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: `Enviado a ${sent} alumno(s)${failed > 0 ? `, ${failed} fallido(s)` : ""}`,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { message: "Error al enviar notificaciones" },
      { status: 500 }
    );
  }
}
