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
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests Recientes */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                Tests Disponibles 🚗
              </h2>
            </div>
            <Link
              href="/estudiante/driving-tests"
              className="text-sm font-bold text-yellow-600 hover:underline flex items-center gap-1"
            >
              Ver Todos <ChevronRight size={14} />
            </Link>
          </div>

          {tests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay tests disponibles aún.
            </p>
          ) : (
            <div className="space-y-3">
              {tests.slice(0, 5).map((test) => (
                <Link
                  key={test.id}
                  href={`/estudiante/driving-tests/${test.id}`}
                  className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:border-yellow-100 hover:bg-yellow-50/30 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      test.type === "ERROR"
                        ? "bg-red-50 text-red-500"
                        : test.type === "CUSTOM"
                        ? "bg-purple-50 text-purple-500"
                        : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {test.type === "ERROR" ? "❌" : test.type === "CUSTOM" ? "✨" : "📚"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{test.name}</h4>
                      <p className="text-xs text-gray-400">
                        {test.topic?.name || test.type} · {test._count.questions} preguntas
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-yellow-500 transition" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Topics + Tutor */}
        <div className="space-y-6">
          {/* Best & Worst Topics */}
          {(stats?.bestTopic || stats?.worstTopic) && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Temas</h3>
              {stats?.bestTopic && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                  <TrendingUp size={18} className="text-green-500" />
                  <div>
                    <p className="text-xs text-green-600 font-bold">Mejor tema</p>
                    <p className="text-sm font-bold text-gray-800">{stats.bestTopic.topicName}</p>
                    <p className="text-xs text-gray-400">{stats.bestTopic.avgScore}% aciertos</p>
                  </div>
                </div>
              )}
              {stats?.worstTopic && stats.worstTopic.topicName !== stats.bestTopic?.topicName && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl">
                  <TrendingDown size={18} className="text-red-500" />
                  <div>
                    <p className="text-xs text-red-600 font-bold">Tema a mejorar</p>
                    <p className="text-sm font-bold text-gray-800">{stats.worstTopic.topicName}</p>
                    <p className="text-xs text-gray-400">{stats.worstTopic.avgScore}% aciertos</p>
                  </div>
                </div>
              )}
              <Link
                href="/estudiante/progreso"
                className="block text-center text-sm font-bold text-yellow-600 hover:underline pt-1"
              >
                Ver progreso completo →
              </Link>
            </div>
          )}

          {/* Banner Tutor Virtual */}
          <div className="bg-yellow-50/50 p-6 rounded-[2.5rem] border border-yellow-100 relative overflow-hidden">
            <div className="space-y-3 z-10 relative">
              <div className="flex items-center gap-2 text-yellow-700">
                <Sparkles size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">
                  Tutor Virtual 🧑‍🏫
                </span>
              </div>
              <p className="text-sm text-yellow-800/70 font-medium">
                Obtén ayuda personalizada y resuelve tus dudas al instante.
              </p>
              <Link
                href="/estudiante/tutor"
                className="bg-yellow-500 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-yellow-600 transition shadow-lg shadow-yellow-200 cursor-pointer w-fit"
              >
                <MessageSquare size={16} /> Preguntar al Tutor
              </Link>
            </div>
            <div className="absolute right-4 bottom-4 opacity-10 rotate-12">
              <BookOpen size={80} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
