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
  AlertTriangle,
  FileText,
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

const TEST_TYPE: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  ERROR:  { icon: AlertTriangle, bg: "bg-error/10",  text: "text-error-light"  },
  CUSTOM: { icon: Sparkles,      bg: "bg-brand/10",  text: "text-brand-light"  },
  BASIC:  { icon: BookOpen,      bg: "bg-accent/10", text: "text-accent-light" },
};

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
        <Loader2 className="animate-spin text-accent" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Tests Disponibles ─────────────────────────────── */}
        <div className="lg:col-span-2 bg-surface p-7 rounded-3xl border border-border">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 text-accent-light rounded-xl">
                <FileText size={18} />
              </div>
              <h2 className="text-lg font-bold text-fg-primary tracking-tight">
                Tests Disponibles
              </h2>
            </div>
            <Link
              href="/estudiante/driving-tests"
              className="flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-light transition-colors duration-[120ms]"
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          {tests.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-fg-muted text-sm">
              No hay tests disponibles aún.
            </div>
          ) : (
            <div className="space-y-2">
              {tests.slice(0, 5).map((test) => {
                const { icon: Icon, bg, text } = TEST_TYPE[test.type] ?? TEST_TYPE.BASIC;
                return (
                  <Link
                    key={test.id}
                    href={`/estudiante/driving-tests/${test.id}`}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all duration-[120ms] group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 ${bg} ${text} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-fg-primary text-sm leading-none mb-1">
                          {test.name}
                        </p>
                        <p className="text-xs text-fg-muted">
                          {test.topic?.name || test.type} · {test._count.questions} preguntas
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-fg-subtle group-hover:text-accent transition-colors duration-[120ms] shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right column ──────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Topics card */}
          {(stats?.bestTopic || stats?.worstTopic) && (
            <div className="bg-surface p-6 rounded-3xl border border-border flex-1 flex flex-col justify-center gap-3">
              <p className="text-[10px] font-black text-fg-muted uppercase tracking-widest">
                Temas destacados
              </p>

              {stats?.bestTopic && (
                <div className="flex items-start gap-3 p-3.5 bg-success/8 border border-success/15 rounded-xl">
                  <TrendingUp size={16} className="text-success-light mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-success-light font-black uppercase tracking-wider">
                      Mejor tema
                    </p>
                    <p className="text-sm font-bold text-fg-primary mt-0.5">
                      {stats.bestTopic.topicName}
                    </p>
                    <p className="text-xs text-fg-muted">{stats.bestTopic.avgScore}% aciertos</p>
                  </div>
                </div>
              )}

              {stats?.worstTopic &&
                stats.worstTopic.topicName !== stats.bestTopic?.topicName && (
                  <div className="flex items-start gap-3 p-3.5 bg-error/8 border border-error/15 rounded-xl">
                    <TrendingDown size={16} className="text-error-light mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-error-light font-black uppercase tracking-wider">
                        A mejorar
                      </p>
                      <p className="text-sm font-bold text-fg-primary mt-0.5">
                        {stats.worstTopic.topicName}
                      </p>
                      <p className="text-xs text-fg-muted">{stats.worstTopic.avgScore}% aciertos</p>
                    </div>
                  </div>
                )}

              <Link
                href="/estudiante/progreso"
                className="text-center text-sm font-bold text-accent hover:text-accent-light transition-colors duration-[120ms] pt-1"
              >
                Ver progreso completo →
              </Link>
            </div>
          )}

          {/* Tutor Virtual CTA */}
          <div className="bg-brand/8 p-6 rounded-3xl border border-brand/20 relative overflow-hidden flex-1 flex flex-col justify-center gap-4">
            <div className="absolute right-4 bottom-4 opacity-[0.07] rotate-12 pointer-events-none">
              <BookOpen size={80} className="text-brand-light" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-brand-light">
                <Sparkles size={15} />
                <span className="font-black text-[10px] uppercase tracking-widest">
                  Tutor Virtual
                </span>
              </div>
              <p className="text-sm text-fg-secondary leading-relaxed">
                Obtén ayuda personalizada y resuelve tus dudas al instante.
              </p>
              <Link
                href="/estudiante/tutor"
                className="inline-flex items-center gap-2 h-10 px-5 bg-brand hover:bg-brand-light active:bg-brand-dark text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-brand transition-all duration-[120ms] active:scale-[0.97]"
              >
                <MessageSquare size={15} />
                Preguntar al Tutor
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
