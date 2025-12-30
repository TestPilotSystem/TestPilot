import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        requests: {
          some: { status: "APPROVED" },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dni: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
