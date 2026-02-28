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

const darkTooltipStyle = {
  borderRadius: "16px",
  border: "1px solid #334155",
  backgroundColor: "#1E293B",
  color: "#E2E8F0",
};

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
        <Loader2 className="animate-spin text-brand-light" size={40} />
        <p className="text-slate-400 font-bold">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats || !stats.user) {
    return (
      <div className="text-center py-20 text-slate-500">
        No se pudieron cargar las estadísticas del alumno
      </div>
    );
  }

  const { user } = stats;
  const scoreComparison = stats.averageScore - stats.classAverageScore;

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
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="p-3 hover:bg-slate-800 rounded-2xl transition"
        >
          <ArrowLeft size={24} className="text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-50 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-black text-lg">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-slate-400 font-medium mt-1 ml-16">
            {user.email} {user.dni && `· ${user.dni}`}
          </p>
        </div>
      </div>

      {stats.totalTests === 0 ? (
        <div className="text-center py-20 bg-brand/10 rounded-3xl border border-brand/20">
          <BarChart2 className="w-16 h-16 text-brand-light mx-auto opacity-50 mb-4" />
          <h2 className="text-2xl font-black text-slate-100 mb-2">
            Sin actividad
          </h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto">
            Este alumno aún no ha completado ningún test.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-2xl">
                  <Trophy className="text-accent" size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Tests
                  </p>
                  <p className="text-2xl font-black text-slate-50">
                    {stats.totalTests}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-highlight/10 rounded-2xl">
                  <Clock className="text-highlight" size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Tiempo
                  </p>
                  <p className="text-2xl font-black text-slate-50">
                    {formatTime(stats.totalTimeSeconds)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand/20 rounded-2xl">
                  <Target className="text-brand-light" size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Promedio
                  </p>
                  <p className="text-2xl font-black text-slate-50">
                    {stats.averageScore}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-700 rounded-2xl">
                  <Users className="text-slate-400" size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    vs Clase
                  </p>
                  <p
                    className={`text-2xl font-black ${
                      scoreComparison >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {scoreComparison >= 0 ? "+" : ""}
                    {scoreComparison}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {formattedHistory.length > 1 && (
            <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
              <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-light" />
                Evolución de Puntuaciones
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Progresión cronológica del rendimiento
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Puntuación Media"]}
                      labelFormatter={(_, payload) => {
                        if (payload && payload[0])
                          return `${payload[0].payload.topicName}`;
                        return "";
                      }}
                      contentStyle={darkTooltipStyle}
                      itemStyle={{ color: '#E2E8F0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#5A2A82"
                      strokeWidth={3}
                      dot={{ fill: "#5A2A82", r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {stats.bestTopic && (
                <div className="bg-green-500/10 p-5 rounded-3xl border border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="text-green-400" size={20} />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                      Mejor Tema
                    </span>
                  </div>
                  <p className="text-lg font-black text-slate-100">
                    {stats.bestTopic.topicName}
                  </p>
                  <p className="text-3xl font-black text-green-400 mt-1">
                    {stats.bestTopic.avgScore}%
                  </p>
                </div>
              )}

              {stats.worstTopic &&
                stats.worstTopic.topicId !== stats.bestTopic?.topicId && (
                  <div className="bg-red-500/10 p-5 rounded-3xl border border-red-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingDown className="text-red-400" size={20} />
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                        Área de Mejora
                      </span>
                    </div>
                    <p className="text-lg font-black text-slate-100">
                      {stats.worstTopic.topicName}
                    </p>
                    <p className="text-3xl font-black text-red-400 mt-1">
                      {stats.worstTopic.avgScore}%
                    </p>
                  </div>
                )}
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
              <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Calendar size={18} className="text-brand-light" />
                Actividad Semanal
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Tests completados por semana (últimas 12 semanas)
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Tests"]}
                      contentStyle={darkTooltipStyle}
                      itemStyle={{ color: '#E2E8F0' }}
                      labelStyle={{ color: '#94a3b8' }}
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
                          stopColor="#5A2A82"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#5A2A82"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#5A2A82"
                      strokeWidth={2}
                      fill="url(#actColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {stats.scoreByTopic.length > 0 && (
            <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
              <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Target size={18} className="text-brand-light" />
                Puntuación por Tema
              </h3>
              <p className="text-xs text-slate-500 mb-4">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="topicName"
                      width={150}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Acierto"]}
                      contentStyle={darkTooltipStyle}
                      itemStyle={{ color: '#E2E8F0' }}
                      labelStyle={{ color: '#94a3b8' }}
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

          {stats.testsByTopic.length > 0 && (
            <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
              <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Trophy size={18} className="text-brand-light" />
                Tests Realizados por Tema
              </h3>
              <p className="text-xs text-slate-500 mb-4">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="topicName"
                      width={150}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Tests"]}
                      contentStyle={darkTooltipStyle}
                      itemStyle={{ color: '#E2E8F0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Bar
                      dataKey="count"
                      name="Tests"
                      fill="#5A2A82"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
            <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Users size={18} className="text-brand-light" />
              Comparación con la Clase
            </h3>
            <div className="flex items-center justify-center gap-12">
              <div className="text-center">
                <p className="text-sm text-slate-400 font-medium mb-1">
                  Su Promedio
                </p>
                <p className="text-4xl font-black text-brand-light">
                  {stats.averageScore}%
                </p>
              </div>

              <div className="text-center px-6 py-3 rounded-2xl bg-slate-800">
                <p className="text-sm text-slate-400 font-medium mb-1">
                  Diferencia
                </p>
                <p
                  className={`text-2xl font-black ${
                    scoreComparison >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {scoreComparison >= 0 ? "+" : ""}
                  {scoreComparison}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-400 font-medium mb-1">
                  Media Clase
                </p>
                <p className="text-4xl font-black text-slate-500">
                  {stats.classAverageScore}%
                </p>
              </div>
            </div>

            <div className="mt-8 relative">
              <div className="h-6 bg-slate-800 rounded-full overflow-hidden w-full">
                <div
                  className="h-6 bg-slate-600 absolute rounded-full opacity-60"
                  style={{ width: `${stats.classAverageScore}%` }}
                />
                <div
                  className="h-6 bg-brand-light absolute rounded-full shadow-sm z-10"
                  style={{ width: `${stats.averageScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-xs text-slate-500 font-medium">
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
