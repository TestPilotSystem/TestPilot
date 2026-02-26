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
        <Loader2 className="animate-spin text-yellow-500" size={40} />
        <p className="text-gray-400 font-bold">
          Cargando datos de seguimiento...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        No se pudieron cargar los datos de seguimiento
      </div>
    );
  }

  const pieData = [
    { name: "Activos", value: data.activeStudents, fill: "#22c55e" },
    { name: "Inactivos", value: data.inactiveStudents, fill: "#d1d5db" },
  ];

  const improvementTotal = data.improvement.total;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          <Activity className="text-yellow-600" />
          Seguimiento
        </h1>
        <p className="text-gray-400 font-medium mt-1">
          Vista general del rendimiento de todos los alumnos
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Users className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Total Alumnos
              </p>
              <p className="text-2xl font-black text-gray-800">
                {data.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-2xl">
              <Activity className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Activos (30d)
              </p>
              <p className="text-2xl font-black text-green-600">
                {data.activeStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-2xl">
              <Trophy className="text-yellow-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Tests Totales
              </p>
              <p className="text-2xl font-black text-gray-800">
                {data.totalTestsCompleted}
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
                Media Global
              </p>
              <p className="text-2xl font-black text-gray-800">
                {data.globalAverageScore}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Active/Inactive Pie + Monthly Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Active vs Inactive */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <Users size={18} className="text-yellow-500" />
            Distribución de Alumnos
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Activos vs inactivos (últimos 30 días)
          </p>
          <div className="h-64 flex items-center justify-center">
            {data.totalStudents === 0 ? (
              <p className="text-gray-400 text-sm">No hay alumnos registrados</p>
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
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600 font-medium">
                Activos ({data.activeStudents})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-600 font-medium">
                Inactivos ({data.inactiveStudents})
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Tests Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <BarChart2 size={18} className="text-yellow-500" />
            Tests Completados por Mes
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Evolución de la actividad en los últimos 6 meses
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
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
                    id="monthlyColor"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#eab308"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#eab308"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#eab308"
                  strokeWidth={2.5}
                  fill="url(#monthlyColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Students Metrics */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-green-600" />
          Métricas de Alumnos Activos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Alumnos Activos
            </p>
            <p className="text-2xl font-black text-green-600 mt-1">
              {data.activeMetrics.count}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Media Puntuación
            </p>
            <p className="text-2xl font-black text-gray-800 mt-1">
              {data.activeMetrics.averageScore}%
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tests por Alumno
            </p>
            <p className="text-2xl font-black text-gray-800 mt-1">
              {data.activeMetrics.testsPerStudent}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Tiempo Medio
            </p>
            <p className="text-2xl font-black text-gray-800 mt-1">
              {formatTime(data.activeMetrics.avgTimePerStudent)}
            </p>
          </div>
        </div>
      </div>

      {/* Row: Score Distribution + Student Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <Target size={18} className="text-yellow-500" />
            Distribución de Notas
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Todos los tests completados
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
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
                <Bar dataKey="count" name="Tests" radius={[8, 8, 0, 0]}>
                  {data.scoreDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Level Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <Users size={18} className="text-yellow-500" />
            Distribución de Alumnos por Nivel
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Según la media de cada alumno
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentLevels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="level"
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Alumnos"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
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

      {/* Topic Ranking */}
      {data.topicRanking.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Rendimiento por Tema
          </h3>
          <p className="text-xs text-gray-400 mb-4">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  type="category"
                  dataKey="topicName"
                  width={160}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "avgScore") return [`${value}%`, "Puntuación Media"];
                    return [value, "Tests"];
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
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

      {/* Improvement Metrics */}
      {improvementTotal > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-yellow-500" />
            Tasa de Mejora
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Comparación del rendimiento inicial vs actual (alumnos con 4+ tests)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 text-center">
              <TrendingUp className="text-green-600 mx-auto mb-2" size={28} />
              <p className="text-3xl font-black text-green-600">
                {data.improvement.improved}
              </p>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                Han mejorado
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {improvementTotal > 0
                  ? Math.round(
                      (data.improvement.improved / improvementTotal) * 100
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-2xl border border-gray-200 text-center">
              <Minus className="text-gray-500 mx-auto mb-2" size={28} />
              <p className="text-3xl font-black text-gray-600">
                {data.improvement.stable}
              </p>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                Se mantienen
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {improvementTotal > 0
                  ? Math.round(
                      (data.improvement.stable / improvementTotal) * 100
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl border border-red-100 text-center">
              <TrendingDown className="text-red-600 mx-auto mb-2" size={28} />
              <p className="text-3xl font-black text-red-600">
                {data.improvement.declined}
              </p>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                Han empeorado
              </p>
              <p className="text-xs text-gray-400 mt-1">
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
