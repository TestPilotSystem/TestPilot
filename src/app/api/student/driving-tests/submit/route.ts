import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { testId, responses, timeSpentSeconds } = await request.json();
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test)
      return NextResponse.json({ message: "Test not found" }, { status: 404 });

    const userId = Number(auth.payload.id);
    let correctCount = 0;

    const userResponsesData = test.questions.map((q) => {
      const givenAnswer = String(responses[q.id] || "").trim();
      const correctAnswer = String(q.respuestaCorrecta).trim();

      const isCorrect =
        givenAnswer.toLowerCase() === correctAnswer.toLowerCase();
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        respuestaDada: givenAnswer,
        esCorrecta: isCorrect,
      };
    });

    const score = Math.round((correctCount / test.questions.length) * 100);

    const userTest = await prisma.userTest.create({
      data: {
        userId,
        testId: test.id,
        score,
        timeSpentSeconds: timeSpentSeconds ?? null,
        completed: true,
        completedAt: new Date(),
        responses: {
          create: userResponsesData,
        },
      },
    });

    return NextResponse.json({ id: userTest.id, score });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
