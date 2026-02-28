"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Users,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Loader2,
  BarChart2,
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
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

interface SeguimientoData {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalTestsCompleted: number;
  globalAverageScore: number;
  activeMetrics: {
    count: number;
    averageScore: number;
    testsPerStudent: number;
    avgTimePerStudent: number;
  };
  scoreDistribution: { range: string; count: number; color: string }[];
  topicRanking: {
    topicName: string;
    avgScore: number;
    totalTests: number;
  }[];
  monthlyTests: { month: string; count: number }[];
  studentLevels: { level: string; count: number; color: string }[];
  improvement: {
    improved: number;
    declined: number;
    stable: number;
    total: number;
  };
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const darkTooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #334155",
  backgroundColor: "#1E293B",
  color: "#E2E8F0",
};

export default function SeguimientoPage() {
  const [data, setData] = useState<SeguimientoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seguimiento")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-accent" size={40} />
        <p className="text-slate-400 font-bold">
          Cargando datos de seguimiento...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-500">
        No se pudieron cargar los datos de seguimiento
      </div>
    );
  }

  const pieData = [
    { name: "Activos", value: data.activeStudents, fill: "#22c55e" },
    { name: "Inactivos", value: data.inactiveStudents, fill: "#475569" },
  ];

  const improvementTotal = data.improvement.total;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-black text-slate-50 tracking-tight flex items-center gap-3">
          <Activity className="text-accent" />
          Seguimiento
        </h1>
        <p className="text-slate-400 font-medium mt-1">
          Vista general del rendimiento de todos los alumnos
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Users className="text-accent" size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Alumnos
              </p>
              <p className="text-2xl font-black text-slate-50">
                {data.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-2xl">
              <Activity className="text-green-400" size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Activos (30d)
              </p>
              <p className="text-2xl font-black text-green-400">
                {data.activeStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-highlight/10 rounded-2xl">
              <Trophy className="text-highlight" size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Tests Totales
              </p>
              <p className="text-2xl font-black text-slate-50">
                {data.totalTestsCompleted}
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
                Media Global
              </p>
              <p className="text-2xl font-black text-slate-50">
                {data.globalAverageScore}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Users size={18} className="text-accent" />
            Distribución de Alumnos
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Activos vs inactivos (últimos 30 días)
          </p>
          <div className="h-64 flex items-center justify-center">
            {data.totalStudents === 0 ? (
              <p className="text-slate-500 text-sm">No hay alumnos registrados</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} alumnos`,
                      name,
                    ]}
                    contentStyle={darkTooltipStyle}
                    itemStyle={{ color: '#E2E8F0' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-300 font-medium">
                Activos ({data.activeStudents})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="text-sm text-slate-300 font-medium">
                Inactivos ({data.inactiveStudents})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
            <BarChart2 size={18} className="text-accent" />
            Tests Completados por Mes
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Evolución de la actividad en los últimos 6 meses
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
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
                    id="monthlyColor"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563EB"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#monthlyColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20">
        <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-green-400" />
          Métricas de Alumnos Activos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Alumnos Activos
            </p>
            <p className="text-2xl font-black text-green-400 mt-1">
              {data.activeMetrics.count}
            </p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Media Puntuación
            </p>
            <p className="text-2xl font-black text-slate-100 mt-1">
              {data.activeMetrics.averageScore}%
            </p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Tests por Alumno
            </p>
            <p className="text-2xl font-black text-slate-100 mt-1">
              {data.activeMetrics.testsPerStudent}
            </p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Tiempo Medio
            </p>
            <p className="text-2xl font-black text-slate-100 mt-1">
              {formatTime(data.activeMetrics.avgTimePerStudent)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Target size={18} className="text-accent" />
            Distribución de Notas
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Todos los tests completados
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Tests"]}
                  contentStyle={darkTooltipStyle}
                  itemStyle={{ color: '#E2E8F0' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" name="Tests" radius={[8, 8, 0, 0]}>
                  {data.scoreDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Users size={18} className="text-accent" />
            Distribución de Alumnos por Nivel
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Según la media de cada alumno
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentLevels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="level"
                  tick={{ fontSize: 9, fill: "#64748B" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Alumnos"]}
                  contentStyle={darkTooltipStyle}
                  itemStyle={{ color: '#E2E8F0' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" name="Alumnos" radius={[8, 8, 0, 0]}>
                  {data.studentLevels.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {data.topicRanking.length > 0 && (
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            Rendimiento por Tema
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Media de puntuación global por área temática (ordenado por rendimiento)
          </p>
          <div
            className="w-full"
            style={{
              height: Math.max(200, data.topicRanking.length * 50),
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topicRanking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  type="category"
                  dataKey="topicName"
                  width={160}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "avgScore") return [`${value}%`, "Puntuación Media"];
                    return [value, "Tests"];
                  }}
                  contentStyle={darkTooltipStyle}
                  itemStyle={{ color: '#E2E8F0' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar
                  dataKey="avgScore"
                  name="avgScore"
                  radius={[0, 8, 8, 0]}
                >
                  {data.topicRanking.map((entry, index) => (
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

      {improvementTotal > 0 && (
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            Tasa de Mejora
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Comparación del rendimiento inicial vs actual (alumnos con 4+ tests)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/20 text-center">
              <TrendingUp className="text-green-400 mx-auto mb-2" size={28} />
              <p className="text-3xl font-black text-green-400">
                {data.improvement.improved}
              </p>
              <p className="text-sm text-slate-300 font-semibold mt-1">
                Han mejorado
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {improvementTotal > 0
                  ? Math.round(
                      (data.improvement.improved / improvementTotal) * 100
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="bg-slate-700/30 p-5 rounded-2xl border border-slate-600/50 text-center">
              <Minus className="text-slate-400 mx-auto mb-2" size={28} />
              <p className="text-3xl font-black text-slate-300">
                {data.improvement.stable}
              </p>
              <p className="text-sm text-slate-300 font-semibold mt-1">
                Se mantienen
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {improvementTotal > 0
                  ? Math.round(
                      (data.improvement.stable / improvementTotal) * 100
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20 text-center">
              <TrendingDown className="text-red-400 mx-auto mb-2" size={28} />
              <p className="text-3xl font-black text-red-400">
                {data.improvement.declined}
              </p>
              <p className="text-sm text-slate-300 font-semibold mt-1">
                Han empeorado
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {improvementTotal > 0
                  ? Math.round(
                      (data.improvement.declined / improvementTotal) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
