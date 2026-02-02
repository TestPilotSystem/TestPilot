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

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let chatConfig = await prisma.chatConfig.findUnique({
      where: { id: "default" },
    });

    if (!chatConfig) {
      chatConfig = await prisma.chatConfig.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({
      tone: chatConfig.tone,
      useStudentNames: chatConfig.useStudentNames,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { tone, useStudentNames } = body;

    const validTones = ["formal", "informal", "conciso", "detallado"];
    if (tone && !validTones.includes(tone)) {
      return NextResponse.json({ error: "Tono inválido" }, { status: 400 });
    }

    if (tone === "conciso" && useStudentNames === true) {
      return NextResponse.json(
        { error: "El tono 'Conciso' no es compatible con dirigirse al estudiante por su nombre" },
        { status: 400 }
      );
    }

    const chatConfig = await prisma.chatConfig.upsert({
      where: { id: "default" },
      update: {
        ...(tone !== undefined && { tone }),
        ...(useStudentNames !== undefined && { useStudentNames }),
      },
      create: {
        id: "default",
        tone: tone || "formal",
        useStudentNames: useStudentNames || false,
      },
    });

    return NextResponse.json({
      tone: chatConfig.tone,
      useStudentNames: chatConfig.useStudentNames,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
