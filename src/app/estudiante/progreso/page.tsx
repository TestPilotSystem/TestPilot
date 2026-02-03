"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
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
} from "recharts";
import Link from "next/link";

interface TopicStat {
  topicId: string;
  topicName: string;
  count?: number;
  avgScore?: number;
}

interface Stats {
  totalTests: number;
  testsByTopic: TopicStat[];
  totalTimeSeconds: number;
  averageScore: number;
  scoreByTopic: TopicStat[];
  bestTopic: TopicStat | null;
  worstTopic: TopicStat | null;
  classAverageScore: number;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function ProgresoPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  useEffect(() => {
    fetch("/api/estudiante/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-500">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  // Show empty state if no tests completed
  if (stats.totalTests === 0) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <BarChart2 className="text-yellow-600" />
            Tu Progreso 📊
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Estadísticas detalladas de tu rendimiento
          </p>
        </header>

        <div className="text-center py-20 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border border-yellow-100">
          <div className="mb-6">
            <BookOpen className="w-16 h-16 text-yellow-500 mx-auto opacity-50" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            ¡Aún no tienes estadísticas!
          </h2>
          <p className="text-gray-500 font-medium mb-6 max-w-md mx-auto">
            Completa tu primer test para empezar a ver tu progreso y compararte con el resto de la clase.
          </p>
          <Link
            href="/estudiante/driving-tests"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg shadow-yellow-100"
          >
            <BookOpen size={20} />
            Ir a Tests
          </Link>
        </div>
      </div>
    );
  }

  const scoreComparison = stats.averageScore - stats.classAverageScore;
  const hasScoreData = stats.averageScore > 0 || stats.classAverageScore > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          <BarChart2 className="text-yellow-600" />
          Tu Progreso 📊
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Estadísticas detalladas de tu rendimiento
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tests */}
        <div
          className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition ${
            stats.testsByTopic.length > 0 ? "cursor-pointer hover:shadow-md" : ""
          }`}
          onClick={() => stats.testsByTopic.length > 0 && setShowTopicDetails(!showTopicDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Trophy className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Tests Totales</p>
                <p className="text-3xl font-black text-gray-800">{stats.totalTests}</p>
              </div>
            </div>
            {stats.testsByTopic.length > 0 && (
              showTopicDetails ? (
                <ChevronUp className="text-gray-400" />
              ) : (
                <ChevronDown className="text-gray-400" />
              )
            )}
          </div>
        </div>

        {/* Total Time */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tiempo Total</p>
              <p className="text-3xl font-black text-gray-800">
                {formatTime(stats.totalTimeSeconds)}
              </p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div
          className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition ${
            stats.scoreByTopic.length > 0 ? "cursor-pointer hover:shadow-md" : ""
          }`}
          onClick={() => stats.scoreByTopic.length > 0 && setShowScoreDetails(!showScoreDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-2xl">
                <Target className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Promedio</p>
                <p className="text-3xl font-black text-gray-800">{stats.averageScore}%</p>
              </div>
            </div>
            {stats.scoreByTopic.length > 0 && (
              showScoreDetails ? (
                <ChevronUp className="text-gray-400" />
              ) : (
                <ChevronDown className="text-gray-400" />
              )
            )}
          </div>
        </div>
      </div>

      {/* Tests by Topic (Expandable) */}
      {showTopicDetails && stats.testsByTopic.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Tests por Tema</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.testsByTopic} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="topicName"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [value, "Tests"]}
                  labelStyle={{ color: "#374151", fontWeight: "bold" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="count" name="Tests" fill="#eab308" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Score by Topic (Expandable) */}
      {showScoreDetails && stats.scoreByTopic.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Puntuación por Tema</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scoreByTopic} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="topicName"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Promedio"]}
                  labelStyle={{ color: "#374151", fontWeight: "bold" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="avgScore" name="Promedio" radius={[0, 8, 8, 0]}>
                  {stats.scoreByTopic.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        (entry.avgScore ?? 0) >= 70
                          ? "#22c55e"
                          : (entry.avgScore ?? 0) >= 50
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

      {/* Best and Worst Topic */}
      {(stats.bestTopic || stats.worstTopic) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.bestTopic && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-600" size={24} />
                <span className="text-sm font-bold text-green-700 uppercase tracking-wide">
                  Mejor Tema
                </span>
              </div>
              <p className="text-xl font-black text-gray-800">{stats.bestTopic.topicName}</p>
              <p className="text-3xl font-black text-green-600 mt-1">
                {stats.bestTopic.avgScore}%
              </p>
            </div>
          )}

          {stats.worstTopic && stats.worstTopic.topicId !== stats.bestTopic?.topicId && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-3xl border border-red-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="text-red-600" size={24} />
                <span className="text-sm font-bold text-red-700 uppercase tracking-wide">
                  Área de Mejora
                </span>
              </div>
              <p className="text-xl font-black text-gray-800">{stats.worstTopic.topicName}</p>
              <p className="text-3xl font-black text-red-600 mt-1">
                {stats.worstTopic.avgScore}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Class Comparison - only show if there's data */}
      {hasScoreData && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Comparación con la Clase</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <p className="text-sm text-gray-500 font-medium mb-1">Tu Promedio</p>
              <p className="text-4xl font-black text-yellow-600">{stats.averageScore}%</p>
            </div>

            <div className="text-center px-6 py-3 rounded-2xl bg-gray-50">
              <p className="text-sm text-gray-500 font-medium mb-1">Diferencia</p>
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
              <p className="text-sm text-gray-500 font-medium mb-1">Media Clase</p>
              <p className="text-4xl font-black text-gray-400">{stats.classAverageScore}%</p>
            </div>
          </div>

          {/* Visual comparison bar */}
          <div className="mt-8 relative">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-300 absolute"
                style={{ width: `${stats.classAverageScore}%` }}
              />
              <div
                className="h-full bg-yellow-500 absolute rounded-full"
                style={{ width: `${stats.averageScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
