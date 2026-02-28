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

const darkTooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #334155",
  backgroundColor: "#1E293B",
  color: "#E2E8F0",
};

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
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-slate-500">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  if (stats.totalTests === 0) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight flex items-center gap-3">
            <BarChart2 className="text-accent" />
            Tu Progreso 📊
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Estadísticas detalladas de tu rendimiento
          </p>
        </header>

        <div className="text-center py-20 bg-brand/10 rounded-3xl border border-brand/20">
          <div className="mb-6">
            <BookOpen className="w-16 h-16 text-brand-light mx-auto opacity-50" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 mb-2">
            ¡Aún no tienes estadísticas!
          </h2>
          <p className="text-slate-400 font-medium mb-6 max-w-md mx-auto">
            Completa tu primer test para empezar a ver tu progreso y compararte con el resto de la clase.
          </p>
          <Link
            href="/estudiante/driving-tests"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg shadow-accent/20"
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
        <h1 className="text-3xl font-black text-slate-50 tracking-tight flex items-center gap-3">
          <BarChart2 className="text-accent" />
          Tu Progreso 📊
        </h1>
        <p className="text-slate-400 font-medium mt-1">
          Estadísticas detalladas de tu rendimiento
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`bg-surface p-6 rounded-3xl border border-slate-700/50 transition ${
            stats.testsByTopic.length > 0 ? "cursor-pointer hover:border-slate-600" : ""
          }`}
          onClick={() => stats.testsByTopic.length > 0 && setShowTopicDetails(!showTopicDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Trophy className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Tests Totales</p>
                <p className="text-3xl font-black text-slate-50">{stats.totalTests}</p>
              </div>
            </div>
            {stats.testsByTopic.length > 0 && (
              showTopicDetails ? (
                <ChevronUp className="text-slate-500" />
              ) : (
                <ChevronDown className="text-slate-500" />
              )
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-highlight/10 rounded-2xl">
              <Clock className="text-highlight" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Tiempo Total</p>
              <p className="text-3xl font-black text-slate-50">
                {formatTime(stats.totalTimeSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`bg-surface p-6 rounded-3xl border border-slate-700/50 transition ${
            stats.scoreByTopic.length > 0 ? "cursor-pointer hover:border-slate-600" : ""
          }`}
          onClick={() => stats.scoreByTopic.length > 0 && setShowScoreDetails(!showScoreDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <Target className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Promedio</p>
                <p className="text-3xl font-black text-slate-50">{stats.averageScore}%</p>
              </div>
            </div>
            {stats.scoreByTopic.length > 0 && (
              showScoreDetails ? (
                <ChevronUp className="text-slate-500" />
              ) : (
                <ChevronDown className="text-slate-500" />
              )
            )}
          </div>
        </div>
      </div>

      {showTopicDetails && stats.testsByTopic.length > 0 && (
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-4">Tests por Tema</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.testsByTopic} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: "#64748B" }} />
                <YAxis
                  type="category"
                  dataKey="topicName"
                  width={150}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  formatter={(value) => [value, "Tests"]}
                  contentStyle={darkTooltipStyle}
                  itemStyle={{ color: '#E2E8F0' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" name="Tests" fill="#2563EB" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showScoreDetails && stats.scoreByTopic.length > 0 && (
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-4">Puntuación por Tema</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scoreByTopic} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748B" }} />
                <YAxis
                  type="category"
                  dataKey="topicName"
                  width={150}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Promedio"]}
                  contentStyle={darkTooltipStyle}
                  itemStyle={{ color: '#E2E8F0' }}
                  labelStyle={{ color: '#94a3b8' }}
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

      {(stats.bestTopic || stats.worstTopic) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.bestTopic && (
            <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-400" size={24} />
                <span className="text-sm font-bold text-green-400 uppercase tracking-wide">
                  Mejor Tema
                </span>
              </div>
              <p className="text-xl font-black text-slate-100">{stats.bestTopic.topicName}</p>
              <p className="text-3xl font-black text-green-400 mt-1">
                {stats.bestTopic.avgScore}%
              </p>
            </div>
          )}

          {stats.worstTopic && stats.worstTopic.topicId !== stats.bestTopic?.topicId && (
            <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="text-red-400" size={24} />
                <span className="text-sm font-bold text-red-400 uppercase tracking-wide">
                  Área de Mejora
                </span>
              </div>
              <p className="text-xl font-black text-slate-100">{stats.worstTopic.topicName}</p>
              <p className="text-3xl font-black text-red-400 mt-1">
                {stats.worstTopic.avgScore}%
              </p>
            </div>
          )}
        </div>
      )}

      {hasScoreData && (
        <div className="bg-surface p-6 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 mb-6">Comparación con la Clase</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <p className="text-sm text-slate-400 font-medium mb-1">Tu Promedio</p>
              <p className="text-4xl font-black text-accent">{stats.averageScore}%</p>
            </div>

            <div className="text-center px-6 py-3 rounded-2xl bg-slate-800">
              <p className="text-sm text-slate-400 font-medium mb-1">Diferencia</p>
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
              <p className="text-sm text-slate-400 font-medium mb-1">Media Clase</p>
              <p className="text-4xl font-black text-slate-500">{stats.classAverageScore}%</p>
            </div>
          </div>

          <div className="mt-8 relative">
            <div className="h-6 bg-slate-800 rounded-full overflow-hidden w-full">
              <div
                className="h-6 bg-slate-600 absolute rounded-full opacity-60"
                style={{ width: `${stats.classAverageScore}%` }}
              />
              <div
                className="h-6 bg-accent absolute rounded-full shadow-sm z-10"
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
      )}
    </div>
  );
}
