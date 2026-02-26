import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID de usuario no válido" },
        { status: 400 }
      );
    }

    // Verify user exists and is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dni: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Get all completed tests for this user
    const userTests = await prisma.userTest.findMany({
      where: { userId, completed: true },
      include: {
        test: {
          include: { topic: true },
        },
      },
      orderBy: { completedAt: "asc" },
    });

    // Basic stats
    const totalTests = userTests.length;
    const totalTimeSeconds = userTests.reduce(
      (acc, ut) => acc + (ut.timeSpentSeconds ?? 0),
      0
    );

    const scores = userTests
      .filter((ut) => ut.score !== null)
      .map((ut) => ut.score!);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Score history (chronological)
    const scoreHistory = userTests
      .filter((ut) => ut.score !== null && ut.completedAt !== null)
      .map((ut) => ({
        date: ut.completedAt!.toISOString(),
        score: ut.score!,
        topicName: ut.test.topic?.name ?? "Sin tema",
      }));

    // Group by topic
    const topicStats: Record<
      string,
      {
        topicId: string;
        topicName: string;
        count: number;
        totalScore: number;
        scoreCount: number;
      }
    > = {};

    for (const ut of userTests) {
      const topicId = ut.test.topicId ?? "unknown";
      const topicName = ut.test.topic?.name ?? "Sin tema";

      if (!topicStats[topicId]) {
        topicStats[topicId] = {
          topicId,
          topicName,
          count: 0,
          totalScore: 0,
          scoreCount: 0,
        };
      }

      topicStats[topicId].count++;
      if (ut.score !== null) {
        topicStats[topicId].totalScore += ut.score;
        topicStats[topicId].scoreCount++;
      }
    }

    const testsByTopic = Object.values(topicStats).map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      count: t.count,
    }));

    const scoreByTopic = Object.values(topicStats)
      .filter((t) => t.scoreCount > 0)
      .map((t) => ({
        topicId: t.topicId,
        topicName: t.topicName,
        avgScore: Math.round(t.totalScore / t.scoreCount),
      }));

    // Best and worst topic
    let bestTopic: {
      topicId: string;
      topicName: string;
      avgScore: number;
    } | null = null;
    let worstTopic: {
      topicId: string;
      topicName: string;
      avgScore: number;
    } | null = null;

    if (scoreByTopic.length > 0) {
      const sorted = [...scoreByTopic].sort((a, b) => b.avgScore - a.avgScore);
      bestTopic = sorted[0];
      worstTopic = sorted[sorted.length - 1];
    }

    // Activity by week (last 12 weeks)
    const now = new Date();
    const weeklyActivity: { week: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = userTests.filter((ut) => {
        if (!ut.completedAt) return false;
        return ut.completedAt >= weekStart && ut.completedAt < weekEnd;
      }).length;

      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeklyActivity.push({ week: label, count });
    }

    // Class average for comparison
    const allStudentTests = await prisma.userTest.findMany({
      where: {
        completed: true,
        score: { not: null },
        user: { role: "STUDENT" },
      },
      select: { score: true },
    });

    const allScores = allStudentTests.map((t) => t.score!);
    const classAverageScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    return NextResponse.json({
      user,
      totalTests,
      totalTimeSeconds,
      averageScore,
      scoreHistory,
      testsByTopic,
      scoreByTopic,
      bestTopic,
      worstTopic,
      weeklyActivity,
      classAverageScore,
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return NextResponse.json(
      { message: "Error al obtener estadísticas del alumno" },
      { status: 500 }
    );
  }
}
