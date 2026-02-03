import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function GET(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const typesParam = searchParams.get("types") || "";
    
    // Parse types filter (comma-separated: "BASIC,ERROR,CUSTOM")
    const typesFilter = typesParam
      ? typesParam.split(",").filter((t) => ["BASIC", "ERROR", "CUSTOM"].includes(t))
      : [];

    const tests = await prisma.test.findMany({
      where: {
        AND: [
          // Search by topic name
          search
            ? {
                topic: {
                  name: {
                    contains: search,
                  },
                },
              }
            : {},
          // Filter by type (when schema is updated, for now return all)
          // typesFilter.length > 0 ? { type: { in: typesFilter } } : {},
        ],
      },
      include: {
        topic: {
          select: { name: true },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add virtual type field for now (all are BASIC until schema is updated)
    const testsWithType = tests.map((test) => ({
      ...test,
      type: "BASIC" as const,
    }));

    // Apply client-side type filter until schema is updated
    const filteredTests = typesFilter.length > 0
      ? testsWithType.filter((t) => typesFilter.includes(t.type))
      : testsWithType;

    return NextResponse.json(filteredTests);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los tests" },
      { status: 500 }
    );
  }
}
