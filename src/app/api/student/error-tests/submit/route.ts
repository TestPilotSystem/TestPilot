import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

const normalizeKey = (text: string) => {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, "");
};

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const userId = Number(auth.payload.id);
    const { testId, responses } = await request.json();

    const responseList = Array.isArray(responses) 
      ? responses 
      : Object.entries(responses).map(([questionId, answer]) => ({ questionId, answer }));

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test || (test as any).type !== "ERROR") {
      return NextResponse.json({ message: "Test inválido" }, { status: 400 });
    }

    if ((test as any).userId !== userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    let correctCount = 0;
    let rectifiedCount = 0;

    for (const response of responseList) {
      const question = test.questions.find((q) => q.id === response.questionId);
      
      if (!question) continue;

      const isCorrect = response.answer === question.respuestaCorrecta;

      if (isCorrect) {
        correctCount++;

        const matchingQuestions = await prisma.question.findMany({
          where: {
            enunciado: question.enunciado,
            respuestaCorrecta: question.respuestaCorrecta,
            test: {
              type: "BASIC", 
            } as any,
          },
          select: { id: true },
        });

        const matchingQuestionIds = matchingQuestions.map(q => q.id);

        if (matchingQuestionIds.length > 0) {
          const failuresToRectify = await prisma.userResponse.findMany({
            where: {
              userTest: {
                userId,
                test: { type: "BASIC" } as any
              },
              questionId: { in: matchingQuestionIds },
              esCorrecta: false,
              isRectified: false,
            } as any,
            select: { id: true }
          });

          if (failuresToRectify.length > 0) {
            await prisma.userResponse.updateMany({
              where: {
                id: { in: failuresToRectify.map(f => f.id) }
              },
              data: { isRectified: true } as any
            });
            rectifiedCount += failuresToRectify.length;
          }
        }
      }
    }

    return NextResponse.json({
      message: "Test procesado",
      correctCount,
      totalQuestions: test.questions.length,
      rectifiedCount,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al procesar el test" },
      { status: 500 }
    );
  }
}
