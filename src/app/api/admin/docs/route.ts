import { NextResponse } from "next/server";
import { config } from "@/lib/config";

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

    return NextResponse.json({ message: "Base de datos reseteada" });
  } catch (error) {
    return NextResponse.json({ message: "Error al resetear" }, { status: 500 });
  }
}
