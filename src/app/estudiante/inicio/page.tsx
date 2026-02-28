"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalTests: number;
  averageScore: number;
  totalTimeSeconds: number;
  bestTopic: { topicName: string; avgScore: number } | null;
  worstTopic: { topicName: string; avgScore: number } | null;
  classAverageScore: number;
}

interface TestItem {
  id: number;
  name: string;
  type: string;
  topic?: { name: string };
  _count: { questions: number };
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, testsRes] = await Promise.all([
        fetch("/api/estudiante/stats"),
        fetch("/api/student/driving-tests?limit=5"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (testsRes.ok) setTests(await testsRes.json());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-8 rounded-[2.5rem] border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Tests Disponibles 🚗
              </h2>
            </div>
            <Link
              href="/estudiante/driving-tests"
              className="text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition"
            >
              Ver Todos <ChevronRight size={14} />
            </Link>
          </div>

          {tests.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No hay tests disponibles aún.
            </p>
          ) : (
            <div className="space-y-3">
              {tests.slice(0, 5).map((test) => (
                <Link
                  key={test.id}
                  href={`/estudiante/driving-tests/${test.id}`}
                  className="flex items-center justify-between p-4 border border-slate-700/30 rounded-2xl hover:border-accent/30 hover:bg-accent/5 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      test.type === "ERROR"
                        ? "bg-red-500/10 text-red-400"
                        : test.type === "CUSTOM"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {test.type === "ERROR" ? "❌" : test.type === "CUSTOM" ? "✨" : "📚"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{test.name}</h4>
                      <p className="text-xs text-slate-500">
                        {test.topic?.name || test.type} · {test._count.questions} preguntas
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 transition" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 h-full">
          {(stats?.bestTopic || stats?.worstTopic) && (
            <div className="bg-surface p-6 rounded-[2.5rem] border border-slate-700/50 flex-1 flex flex-col justify-center space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Temas</h3>
              {stats?.bestTopic && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-2xl">
                  <TrendingUp size={18} className="text-green-400" />
                  <div>
                    <p className="text-xs text-green-400 font-bold">Mejor tema</p>
                    <p className="text-sm font-bold text-slate-100">{stats.bestTopic.topicName}</p>
                    <p className="text-xs text-slate-500">{stats.bestTopic.avgScore}% aciertos</p>
                  </div>
                </div>
              )}
              {stats?.worstTopic && stats.worstTopic.topicName !== stats.bestTopic?.topicName && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-2xl">
                  <TrendingDown size={18} className="text-red-400" />
                  <div>
                    <p className="text-xs text-red-400 font-bold">Tema a mejorar</p>
                    <p className="text-sm font-bold text-slate-100">{stats.worstTopic.topicName}</p>
                    <p className="text-xs text-slate-500">{stats.worstTopic.avgScore}% aciertos</p>
                  </div>
                </div>
              )}
              <Link
                href="/estudiante/progreso"
                className="block text-center text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline pt-1 transition"
              >
                Ver progreso completo →
              </Link>
            </div>
          )}

          <div className="bg-brand/10 p-6 rounded-[2.5rem] border border-brand/20 relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="space-y-3 z-10 relative">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">
                  Tutor Virtual 🧑‍🏫
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Obtén ayuda personalizada y resuelve tus dudas al instante.
              </p>
              <Link
                href="/estudiante/tutor"
                className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 cursor-pointer w-fit"
              >
                <MessageSquare size={16} /> Preguntar al Tutor
              </Link>
            </div>
            <div className="absolute right-4 bottom-4 opacity-20 rotate-12">
              <BookOpen size={80} className="text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
