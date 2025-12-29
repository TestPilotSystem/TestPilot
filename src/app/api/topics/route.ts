import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Natural sort (1, 2, 10 instead of 1, 10, 2)
    const sortedTopics = topics.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    return NextResponse.json(sortedTopics);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener temas" },
      { status: 500 }
    );
  }
}
