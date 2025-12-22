import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { changePasswordSchema } from "@/lib/validations/auth";

const JWT_SECRET = process.env.JWT_SECRET || "a_clave_secreta";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      id: string;
    };
    const userEmail = decoded.email;

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCorrectPassword) {
      return NextResponse.json(
        { message: "La contraseña actual es incorrecta" },
        { status: 401 }
      );
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: userEmail },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
      },
    });

    return NextResponse.json(
      { message: "Contraseña cambiada exitosamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en change-password:", err);
    return NextResponse.json(
      { message: "Sesión inválida o error interno" },
      { status: 401 }
    );
  }
}
