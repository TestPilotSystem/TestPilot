import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_clave_secreta"
);

export async function authGuard(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isNotRegisteredPath = pathname === "/login" || pathname === "/register";
  const isAdminPath = pathname.startsWith("/admin");
  const isStudentPath = pathname.startsWith("/estudiante");

  if (!token) {
    if (isAdminPath || isStudentPath) {
      return { error: true, redirectTo: "/login" };
    }
    return { error: false };
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (isNotRegisteredPath) {
      const dest = role === "ADMIN" ? "/admin/inicio" : "/estudiante/inicio";
      return { error: true, redirectTo: dest };
    }

    if (isAdminPath && role !== "ADMIN") {
      return { error: true, redirectTo: "/estudiante/inicio" };
    }

    if (isStudentPath && role !== "STUDENT") {
      return { error: true, redirectTo: "/admin/inicio" };
    }

    return { error: false, payload };
  } catch (e) {
    if (isAdminPath || isStudentPath) {
      return { error: true, redirectTo: "/login" };
    }
    return { error: false };
  }
}

export function passwordChangeGuard(payload: any, pathname: string) {
  const changePasswordPath =
    payload.role === "ADMIN"
      ? "/admin/cambiar-contrasena"
      : "/estudiante/cambiar-contrasena";

  if (payload.mustChangePassword && pathname !== changePasswordPath) {
    return { error: true, redirectTo: changePasswordPath };
  }
  return { error: false };
}
