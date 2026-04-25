import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { role: string };
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function POST() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const response = await fetch(`${config.ai.baseUrl}/admin/ai/topics/`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo conectar con el servicio de IA", synced: 0 },
        { status: 503 }
      );
    }

    const data = await response.json();
    const remoteTopics: string[] = data.topics || [];

    let syncedCount = 0;
    for (const topicName of remoteTopics) {
      const existing = await prisma.topic.findFirst({
        where: { name: topicName },
      });

      if (!existing) {
        await prisma.topic.create({
          data: { name: topicName },
        });
        syncedCount++;
      }
    }

    // Remove topics from Prisma that no longer exist in the vector DB
    const localTopics = await prisma.topic.findMany();
    const remoteTopicSet = new Set(remoteTopics);
    const orphanedTopics = localTopics.filter((t) => !remoteTopicSet.has(t.name));

    if (orphanedTopics.length > 0) {
      const orphanedIds = orphanedTopics.map((t) => t.id);
      await prisma.test.updateMany({
        where: { topicId: { in: orphanedIds } },
        data: { topicId: null },
      });
      await prisma.topic.deleteMany({
        where: { id: { in: orphanedIds } },
      });
    }

    const allTopics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      message: syncedCount > 0 ? `${syncedCount} nuevos topics sincronizados` : "Topics actualizados",
      synced: syncedCount,
      topics: allTopics,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al sincronizar topics" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const topics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener topics" },
      { status: 500 }
    );
  }
}
