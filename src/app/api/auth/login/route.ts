import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/lib/validations/auth";
import { config } from "@/lib/config";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        requests: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only need the latest request
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const latestRequest = user.requests[0];

    // Admin always has access but students need approved requests
    if (user.role !== "ADMIN") {
      if (!latestRequest || latestRequest.status === "PENDING") {
        return NextResponse.json(
          {
            message: "Tu solicitud de acceso aún está pendiente de aprobación.",
          },
          { status: 403 }
        );
      }

      if (latestRequest.status === "REJECTED") {
        return NextResponse.json(
          {
            message: `Tu solicitud ha sido rechazada. Motivo: ${
              latestRequest.adminNotes || "No especificado"
            }`,
          },
          { status: 403 }
        );
      }
    }

    const token = jwt.sign(
      {
        id: String(user.id),
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      } as TokenPayload,
      config.jwt.secret,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        mustChangePassword: user.mustChangePassword,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error: ", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
