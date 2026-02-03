import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { config } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    const userId = parseInt(decoded.id, 10);

    // Get all completed tests for this user
    const userTests = await prisma.userTest.findMany({
      where: { userId, completed: true },
      include: {
        test: {
          include: { topic: true },
        },
      },
    });

    // Calculate total tests
    const totalTests = userTests.length;

    // Calculate total time (in seconds)
    const totalTimeSeconds = userTests.reduce(
      (acc, ut) => acc + (ut.timeSpentSeconds ?? 0),
      0
    );

    // Calculate average score
    const scores = userTests.filter((ut) => ut.score !== null).map((ut) => ut.score!);
    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Group by topic
    const topicStats: Record<string, { topicId: string; topicName: string; count: number; totalScore: number; scoreCount: number }> = {};

    for (const ut of userTests) {
      const topicId = ut.test.topicId;
      const topicName = ut.test.topic.name;

      if (!topicStats[topicId]) {
        topicStats[topicId] = { topicId, topicName, count: 0, totalScore: 0, scoreCount: 0 };
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
    let bestTopic: { topicId: string; topicName: string; avgScore: number } | null = null;
    let worstTopic: { topicId: string; topicName: string; avgScore: number } | null = null;

    if (scoreByTopic.length > 0) {
      const sorted = [...scoreByTopic].sort((a, b) => b.avgScore - a.avgScore);
      bestTopic = sorted[0];
      worstTopic = sorted[sorted.length - 1];
    }

    // Calculate class average (all active students)
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
      totalTests,
      testsByTopic,
      totalTimeSeconds,
      averageScore,
      scoreByTopic,
      bestTopic,
      worstTopic,
      classAverageScore,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
