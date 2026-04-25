import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const response = await fetch(
      `${config.ai.baseUrl}/admin/ai/upload-manual`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Error en el motor de IA");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error de conexión con el backend" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = await fetch(`${config.ai.baseUrl}/admin/ai/reset-db`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error();

    // Sync Prisma: remove all topics now that the vector DB is empty
    const allTopics = await prisma.topic.findMany({ select: { id: true } });
    if (allTopics.length > 0) {
      const allIds = allTopics.map((t) => t.id);
      await prisma.test.updateMany({
        where: { topicId: { in: allIds } },
        data: { topicId: null },
      });
      await prisma.topic.deleteMany();
    }

    return NextResponse.json({ message: "Base de datos reseteada" });
  } catch (error) {
    return NextResponse.json({ message: "Error al resetear" }, { status: 500 });
  }
}
