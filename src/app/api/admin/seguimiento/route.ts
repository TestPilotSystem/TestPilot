import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // All approved students
    const allStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        requests: { some: { status: "APPROVED" } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const totalStudents = allStudents.length;

    // All completed tests with scores
    const allUserTests = await prisma.userTest.findMany({
      where: {
        completed: true,
        user: { role: "STUDENT" },
      },
      include: {
        test: { include: { topic: true } },
      },
      orderBy: { completedAt: "asc" },
    });

    // Determine active students (at least 1 completed test in last 30 days)
    const activeStudentIds = new Set<number>();
    for (const ut of allUserTests) {
      if (ut.completedAt && ut.completedAt >= thirtyDaysAgo) {
        activeStudentIds.add(ut.userId);
      }
    }

    const activeStudents = activeStudentIds.size;
    const inactiveStudents = totalStudents - activeStudents;

    // Total tests completed
    const totalTestsCompleted = allUserTests.length;

    // Global average score
    const scoredTests = allUserTests.filter((ut) => ut.score !== null);
    const globalAverageScore =
      scoredTests.length > 0
        ? Math.round(
            scoredTests.reduce((acc, ut) => acc + ut.score!, 0) /
              scoredTests.length
          )
        : 0;

    // --- Active students metrics ---
    const activeUserTests = allUserTests.filter((ut) =>
      activeStudentIds.has(ut.userId)
    );
    const activeScoredTests = activeUserTests.filter(
      (ut) => ut.score !== null
    );
    const activeAverageScore =
      activeScoredTests.length > 0
        ? Math.round(
            activeScoredTests.reduce((acc, ut) => acc + ut.score!, 0) /
              activeScoredTests.length
          )
        : 0;

    const activeTestsPerStudent =
      activeStudents > 0
        ? Math.round((activeUserTests.length / activeStudents) * 10) / 10
        : 0;

    const activeTotalTime = activeUserTests.reduce(
      (acc, ut) => acc + (ut.timeSpentSeconds ?? 0),
      0
    );
    const activeAvgTimePerStudent =
      activeStudents > 0 ? Math.round(activeTotalTime / activeStudents) : 0;

    // --- Score distribution (all students) ---
    const scoreDistribution = [
      { range: "0-30%", count: 0, color: "#ef4444" },
      { range: "30-50%", count: 0, color: "#f97316" },
      { range: "50-70%", count: 0, color: "#eab308" },
      { range: "70-90%", count: 0, color: "#22c55e" },
      { range: "90-100%", count: 0, color: "#10b981" },
    ];

    for (const ut of scoredTests) {
      const s = ut.score!;
      if (s < 30) scoreDistribution[0].count++;
      else if (s < 50) scoreDistribution[1].count++;
      else if (s < 70) scoreDistribution[2].count++;
      else if (s < 90) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    }

    // --- Topic ranking ---
    const topicData: Record<
      string,
      { topicName: string; totalScore: number; count: number }
    > = {};

    for (const ut of scoredTests) {
      const topicName = ut.test.topic?.name ?? "Sin tema";
      const topicId = ut.test.topicId ?? "unknown";
      if (!topicData[topicId]) {
        topicData[topicId] = { topicName, totalScore: 0, count: 0 };
      }
      topicData[topicId].totalScore += ut.score!;
      topicData[topicId].count++;
    }

    const topicRanking = Object.values(topicData)
      .map((t) => ({
        topicName: t.topicName,
        avgScore: Math.round(t.totalScore / t.count),
        totalTests: t.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    // --- Tests completed per month (last 6 months) ---
    const monthlyTests: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = allUserTests.filter((ut) => {
        if (!ut.completedAt) return false;
        return ut.completedAt >= monthStart && ut.completedAt < monthEnd;
      }).length;

      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      ];
      monthlyTests.push({
        month: `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear().toString().slice(-2)}`,
        count,
      });
    }

    // --- Student average distribution ---
    const studentScores: Record<number, number[]> = {};
    for (const ut of scoredTests) {
      if (!studentScores[ut.userId]) {
        studentScores[ut.userId] = [];
      }
      studentScores[ut.userId].push(ut.score!);
    }

    const studentLevels = [
      { level: "Bajo (0-30%)", count: 0, color: "#ef4444" },
      { level: "Medio-Bajo (30-50%)", count: 0, color: "#f97316" },
      { level: "Medio (50-70%)", count: 0, color: "#eab308" },
      { level: "Alto (70-90%)", count: 0, color: "#22c55e" },
      { level: "Excelente (90-100%)", count: 0, color: "#10b981" },
    ];

    for (const userId of Object.keys(studentScores)) {
      const scores = studentScores[parseInt(userId)];
      const avg = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
      if (avg < 30) studentLevels[0].count++;
      else if (avg < 50) studentLevels[1].count++;
      else if (avg < 70) studentLevels[2].count++;
      else if (avg < 90) studentLevels[3].count++;
      else studentLevels[4].count++;
    }

    // --- Improvement rate (first 3 tests vs last 3 tests avg) ---
    let improvedCount = 0;
    let declinedCount = 0;
    let stableCount = 0;

    for (const userId of Object.keys(studentScores)) {
      const scores = studentScores[parseInt(userId)];
      if (scores.length < 4) continue; // Need at least 4 tests to compare

      const firstThree = scores.slice(0, 3);
      const lastThree = scores.slice(-3);
      const firstAvg =
        firstThree.reduce((a, b) => a + b, 0) / firstThree.length;
      const lastAvg =
        lastThree.reduce((a, b) => a + b, 0) / lastThree.length;

      const diff = lastAvg - firstAvg;
      if (diff > 5) improvedCount++;
      else if (diff < -5) declinedCount++;
      else stableCount++;
    }

    return NextResponse.json({
      // Overview
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalTestsCompleted,
      globalAverageScore,

      // Active students metrics
      activeMetrics: {
        count: activeStudents,
        averageScore: activeAverageScore,
        testsPerStudent: activeTestsPerStudent,
        avgTimePerStudent: activeAvgTimePerStudent,
      },

      // Charts data
      scoreDistribution,
      topicRanking,
      monthlyTests,
      studentLevels,

      // Improvement
      improvement: {
        improved: improvedCount,
        declined: declinedCount,
        stable: stableCount,
        total: improvedCount + declinedCount + stableCount,
      },
    });
  } catch (error) {
    console.error("Error fetching seguimiento stats:", error);
    return NextResponse.json(
      { message: "Error al obtener estadísticas de seguimiento" },
      { status: 500 }
    );
  }
}
