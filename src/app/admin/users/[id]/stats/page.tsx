"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart2,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowLeft,
  Users,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface StudentStats {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    dni: string | null;
    createdAt: string;
  };
  totalTests: number;
  totalTimeSeconds: number;
  averageScore: number;
  scoreHistory: { date: string; score: number; topicName: string }[];
  testsByTopic: { topicId: string; topicName: string; count: number }[];
  scoreByTopic: { topicId: string; topicName: string; avgScore: number }[];
  bestTopic: { topicId: string; topicName: string; avgScore: number } | null;
  worstTopic: { topicId: string; topicName: string; avgScore: number } | null;
  weeklyActivity: { week: string; count: number }[];
  classAverageScore: number;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AdminStudentStatsPage() {
  const params = useParams();
  const router = useRouter();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-violet-500" size={40} />
        <p className="text-gray-400 font-bold">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats || !stats.user) {
    return (
      <div className="text-center py-20 text-gray-500">
        No se pudieron cargar las estadísticas del alumno
      </div>
    );
  }

  const { user } = stats;
  const scoreComparison = stats.averageScore - stats.classAverageScore;

  // Format score history for line chart
  const formattedHistory = stats.scoreHistory.map((entry, i) => ({
    ...entry,
    label: new Date(entry.date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    }),
    index: i + 1,
  }));

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="p-3 hover:bg-gray-100 rounded-2xl transition"
        >
          <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-400 font-medium mt-1 ml-16">
            {user.email} {user.dni && `· ${user.dni}`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {stats.totalTests === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl border border-violet-100">
          <BarChart2 className="w-16 h-16 text-violet-400 mx-auto opacity-50 mb-4" />
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Sin actividad
          </h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            Este alumno aún no ha completado ningún test.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Trophy className="text-blue-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Tests
                  </p>
                  <p className="text-2xl font-black text-gray-800">
                    {stats.totalTests}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <Clock className="text-orange-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Tiempo
                  </p>
                  <p className="text-2xl font-black text-gray-800">
                    {formatTime(stats.totalTimeSeconds)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-50 rounded-2xl">
                  <Target className="text-violet-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Promedio
                  </p>
                  <p className="text-2xl font-black text-gray-800">
                    {stats.averageScore}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <Users className="text-gray-500" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    vs Clase
                  </p>
                  <p
                    className={`text-2xl font-black ${
                      scoreComparison >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {scoreComparison >= 0 ? "+" : ""}
                    {scoreComparison}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Evolution Line Chart */}
          {formattedHistory.length > 1 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-violet-500" />
                Evolución de Puntuaciones
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Progresión cronológica del rendimiento
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Puntuación"]}
                      labelFormatter={(_, payload) => {
                        if (payload && payload[0])
                          return `${payload[0].payload.topicName}`;
                        return "";
                      }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Two column: Best/Worst topics + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best & Worst Topics */}
            <div className="space-y-4">
              {stats.bestTopic && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-3xl border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                      Mejor Tema
                    </span>
                  </div>
                  <p className="text-lg font-black text-gray-800">
                    {stats.bestTopic.topicName}
                  </p>
                  <p className="text-3xl font-black text-green-600 mt-1">
                    {stats.bestTopic.avgScore}%
                  </p>
                </div>
              )}

              {stats.worstTopic &&
                stats.worstTopic.topicId !== stats.bestTopic?.topicId && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-3xl border border-red-100">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingDown className="text-red-600" size={20} />
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                        Área de Mejora
                      </span>
                    </div>
                    <p className="text-lg font-black text-gray-800">
                      {stats.worstTopic.topicName}
                    </p>
                    <p className="text-3xl font-black text-red-600 mt-1">
                      {stats.worstTopic.avgScore}%
                    </p>
                  </div>
                )}
            </div>

            {/* Weekly Activity */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Calendar size={18} className="text-violet-500" />
                Actividad Semanal
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Tests completados por semana (últimas 12 semanas)
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Tests"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="actColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#actColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Score by Topic */}
          {stats.scoreByTopic.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Target size={18} className="text-violet-500" />
                Puntuación por Tema
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Media de puntuación en cada área temática
              </p>
              <div
                className="w-full"
                style={{
                  height: Math.max(200, stats.scoreByTopic.length * 50),
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.scoreByTopic} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="topicName"
                      width={150}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Promedio"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar
                      dataKey="avgScore"
                      name="Promedio"
                      radius={[0, 8, 8, 0]}
                    >
                      {stats.scoreByTopic.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.avgScore >= 70
                              ? "#22c55e"
                              : entry.avgScore >= 50
                              ? "#eab308"
                              : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tests by Topic */}
          {stats.testsByTopic.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Trophy size={18} className="text-violet-500" />
                Tests Realizados por Tema
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Distribución del esfuerzo por área
              </p>
              <div
                className="w-full"
                style={{
                  height: Math.max(200, stats.testsByTopic.length * 50),
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.testsByTopic} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="topicName"
                      width={150}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Tests"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Tests"
                      fill="#8b5cf6"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Class Comparison */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users size={18} className="text-violet-500" />
              Comparación con la Clase
            </h3>
            <div className="flex items-center justify-center gap-12">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Su Promedio
                </p>
                <p className="text-4xl font-black text-violet-600">
                  {stats.averageScore}%
                </p>
              </div>

              <div className="text-center px-6 py-3 rounded-2xl bg-gray-50">
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Diferencia
                </p>
                <p
                  className={`text-2xl font-black ${
                    scoreComparison >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {scoreComparison >= 0 ? "+" : ""}
                  {scoreComparison}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Media Clase
                </p>
                <p className="text-4xl font-black text-gray-400">
                  {stats.classAverageScore}%
                </p>
              </div>
            </div>

            <div className="mt-8 relative">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden w-full">
                <div
                  className="h-6 bg-gray-300 absolute rounded-full opacity-60"
                  style={{ width: `${stats.classAverageScore}%` }}
                />
                <div
                  className="h-6 bg-violet-500 absolute rounded-full shadow-sm z-10"
                  style={{ width: `${stats.averageScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
