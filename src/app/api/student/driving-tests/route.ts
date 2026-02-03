import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";
import { TestType } from "@prisma/client";

export async function GET(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const userId = Number(auth.payload.id);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const typesParam = searchParams.get("types") || "";
    
    const typesFilter = typesParam
      ? typesParam.split(",").filter((t) => ["BASIC", "ERROR", "CUSTOM"].includes(t))
      : [];

    const typeConditions = [];
    
    if (typesFilter.length === 0 || typesFilter.includes("BASIC")) {
      typeConditions.push({ type: "BASIC" as TestType, userId: null });
    }
    
    if (typesFilter.length === 0 || typesFilter.includes("ERROR")) {
      typeConditions.push({ type: "ERROR" as TestType, userId });
    }
    if (typesFilter.length === 0 || typesFilter.includes("CUSTOM")) {
      typeConditions.push({ type: "CUSTOM" as TestType, userId });
    }

    const tests = await prisma.test.findMany({
      where: {
        AND: [
          { OR: typeConditions },
          search
            ? {
                OR: [
                  { topic: { name: { contains: search } } },
                  { name: { contains: search } },
                ],
              }
            : {},
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

    const formattedTests = tests.map(test => ({
      ...test,
      topic: test.topic || { name: test.name || "Test Personalizado" } 
    }));

    return NextResponse.json(formattedTests);
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { message: "Error al obtener los tests" },
      { status: 500 }
    );
  }
}
