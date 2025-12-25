import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, RequestStatus } from "@prisma/client";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { dni, firstName, lastName, email, dateOfBirth, password } =
      result.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { dni }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "El email o el DNI ya están registrados en la plataforma." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction to create user and request atomically
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          dni,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          role: Role.STUDENT,
          mustChangePassword: false,
        },
      });

      await tx.request.create({
        data: {
          userId: newUser.id,
          status: RequestStatus.PENDING,
        },
      });
    });

    return NextResponse.json(
      {
        message:
          "Solicitud de registro enviada con éxito. Espera la aprobación del administrador.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error: ", error);
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
