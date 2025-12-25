import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      where: { status: RequestStatus.PENDING },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            dni: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener solicitudes" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, adminNotes } = body;

    if (!Object.values(RequestStatus).includes(status)) {
      return NextResponse.json(
        { message: "Estado no válido" },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    });

    return NextResponse.json({
      message: `Solicitud ${status.toLowerCase()} con éxito`,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al actualizar la solicitud" },
      { status: 500 }
    );
  }
}
