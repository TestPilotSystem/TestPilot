import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalStudents,
      totalTests,
      totalResponses,
      correctResponses,
      avgScoreResult,
      totalTopics,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.userTest.count({ where: { completed: true } }),
      prisma.userResponse.count(),
      prisma.userResponse.count({ where: { esCorrecta: true } }),
      prisma.userTest.aggregate({ _avg: { score: true }, where: { completed: true } }),
      prisma.topic.count(),
    ]);

    const successRate =
      totalResponses > 0
        ? Math.round((correctResponses / totalResponses) * 100)
        : 0;

    const avgScore = Math.round(avgScoreResult._avg.score ?? 0);

    return NextResponse.json({
      totalStudents,
      totalTests,
      totalResponses,
      successRate,
      avgScore,
      totalTopics,
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
