import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";
import { config } from "@/lib/config";
import { getAiToken } from "@/lib/aiTokenCache";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const auth = await authGuard(request as any);
  if (auth.error || !auth.payload) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const userId = Number(auth.payload.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, dni: true },
    });

    if (!user || !user.dni) {
      return NextResponse.json(
        { message: "El usuario debe tener un DNI registrado para generar tests personalizados" },
        { status: 400 }
      );
    }

    const completedTests = await prisma.userTest.findMany({
      where: {
        userId,
        completed: true,
        test: { type: "BASIC" } as any,
      },
      include: {
        test: { include: { topic: true } },
        responses: { include: { question: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    // Recent failed questions (last 50)
    const recentFailedQuestions = completedTests
      .flatMap((ut) =>
        ut.responses
          .filter((r) => !r.esCorrecta)
          .map((r) => ({
            enunciado: r.question.enunciado,
            respuestaCorrecta: r.question.respuestaCorrecta,
            respuestaDada: r.respuestaDada,
            topic: ut.test.topic?.name || "Sin tema",
          }))
      )
      .slice(0, 50);

    // Accuracy per topic
    const topicAccuracy: Record<string, { correct: number; total: number }> = {};
    for (const ut of completedTests) {
      const topicName = ut.test.topic?.name || "Sin tema";
      if (!topicAccuracy[topicName]) {
        topicAccuracy[topicName] = { correct: 0, total: 0 };
      }
      for (const r of ut.responses) {
        topicAccuracy[topicName].total++;
        if (r.esCorrecta) topicAccuracy[topicName].correct++;
      }
    }

    const accuracyByTopic: Record<string, number> = {};
    for (const [topic, stats] of Object.entries(topicAccuracy)) {
      accuracyByTopic[topic] =
        stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : 0;
    }

    let worstTopic = "";
    let worstAccuracy = 101;
    for (const [topic, accuracy] of Object.entries(accuracyByTopic)) {
      if (accuracy < worstAccuracy) {
        worstAccuracy = accuracy;
        worstTopic = topic;
      }
    }

    const studentStats = {
      recent_failed_questions: recentFailedQuestions,
      accuracy_by_topic: accuracyByTopic,
      worst_topic: worstTopic || null,
    };

    const fullName = `${user.firstName} ${user.lastName}`;
    const aiToken = await getAiToken(userId, fullName, user.dni);

    const generateResponse = await fetch(
      `${config.ai.baseUrl}/custom-test/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": aiToken,
        },
        body: JSON.stringify({ student_stats: studentStats }),
      }
    );

    if (!generateResponse.ok) {
      if (generateResponse.status === 429) {
        const studentName = `${user.firstName} ${user.lastName}`;
        prisma.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        }).then((admins) => {
          admins.forEach((admin) =>
            createNotification(admin.id, "ADMIN_MESSAGE", {
              messageTitle: "⚠️ Límite de tests personalizados alcanzado",
              messageBody: `El alumno ${studentName} ha superado el límite de generación de tests personalizados por hora.`,
            }).catch(console.error)
          );
        });

        return NextResponse.json(
          { message: "Has excedido el límite de generación. Inténtalo de nuevo más tarde." },
          { status: 429 }
        );
      }
      const errorData = await generateResponse.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Error al generar test personalizado desde el servicio de IA"
      );
    }

    const generatedData = await generateResponse.json();

    const preguntas = generatedData.preguntas;
    if (!preguntas || !Array.isArray(preguntas) || preguntas.length === 0) {
      console.error("Could not extract preguntas from AI response:", JSON.stringify(generatedData).slice(0, 1000));
      return NextResponse.json(
        { message: "El servicio de IA no generó preguntas válidas" },
        { status: 502 }
      );
    }

    const letters = ["a", "b", "c", "d", "e", "f"];
    const dbQuestions = preguntas.map((p: any) => {
      const opciones: Record<string, string> = {};
      (p.opciones as string[]).forEach((opt: string, i: number) => {
        opciones[letters[i]] = opt;
      });

      return {
        enunciado: p.pregunta,
        opciones,
        respuestaCorrecta: p.respuesta_correcta,
        explicacion: p.explicacion || null,
      };
    });

    await prisma.test.deleteMany({
      where: {
        type: "CUSTOM",
        userId,
      } as any,
    });

    const customTest = await prisma.test.create({
      data: {
        type: "CUSTOM",
        name: "Test Personalizado IA",
        userId,
        questions: {
          create: dbQuestions,
        },
      } as any,
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({
      message: `Test personalizado generado con ${dbQuestions.length} preguntas`,
      customTest,
    });
  } catch (error: any) {
    console.error("Error generating custom test:", error);
    return NextResponse.json(
      { message: error.message || "Error al generar test personalizado" },
      { status: 500 }
    );
  }
}
