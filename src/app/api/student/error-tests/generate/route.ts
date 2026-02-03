import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

const MAX_QUESTIONS_PER_ERROR_TEST = 20;

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const userId = Number(auth.payload.id);

    await prisma.test.deleteMany({
      where: {
        type: "ERROR",
        userId,
      } as any,
    });

    const failedResponses = await prisma.userResponse.findMany({
      where: {
        userTest: {
          userId,
          test: {
            type: "BASIC",
          } as any,
        },
        esCorrecta: false,
        isRectified: false,
        respuestaDada: {
          not: "",
        }, 
      } as any,
      include: {
        question: true,
      },
      orderBy: {
        id: "desc", 
      },
    });

    const uniqueQuestionsMap = new Map();
    for (const response of failedResponses) {
      if (!uniqueQuestionsMap.has(response.questionId)) {
        uniqueQuestionsMap.set(response.questionId, (response as any).question);
      }
    }

    const uniqueQuestions = Array.from(uniqueQuestionsMap.values());

    if (uniqueQuestions.length === 0) {
      return NextResponse.json({
        message: "No tienes errores pendientes",
        errorTests: [],
      });
    }

    const errorTests = [];
    const chunks = [];

    for (let i = 0; i < uniqueQuestions.length; i += MAX_QUESTIONS_PER_ERROR_TEST) {
      chunks.push(uniqueQuestions.slice(i, i + MAX_QUESTIONS_PER_ERROR_TEST));
    }

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const testName = chunks.length > 1 
          ? `Repaso de Errores ${i + 1}` 
          : "Repaso de Errores";
  
        const errorTest = await prisma.test.create({
          data: {
            type: "ERROR",
            name: testName,
            userId,
            questions: {
              create: chunk.map((q) => ({
                enunciado: (q as any).enunciado,
                opciones: (q as any).opciones,
                respuestaCorrecta: (q as any).respuestaCorrecta,
                explicacion: (q as any).explicacion,
              })),
            },
          } as any,
          include: {
            _count: { select: { questions: true } },
          },
        });
  
        errorTests.push(errorTest);
      }

    return NextResponse.json({
      message: `Generados ${errorTests.length} tests con ${uniqueQuestions.length} errores pendientes`,
      errorTests,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al generar tests de errores" },
      { status: 500 }
    );
  }
}
