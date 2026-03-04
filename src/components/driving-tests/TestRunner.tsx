"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Send,
  Loader2,
  ChevronsLeft,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TestRunner({ test }: { test: any }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TOTAL_TIME = 30 * 60;

  const [finishState, setFinishState] = useState<{ rectified: number; correct: number; total: number } | null>(null);

  const handleFinish = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (test.type === "ERROR") {
        try {
            const res = await fetch("/api/student/error-tests/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ testId: test.id, responses }),
            });

            if (!res.ok) throw new Error();
            const data = await res.json();

            setFinishState({
              rectified: data.rectifiedCount,
              correct: data.correctCount,
              total: data.totalQuestions
            });
            setIsSubmitting(false);
        } catch (error) {
            toast.error("Error al procesar el test de errores");
            setIsSubmitting(false);
        }
        return;
    }

    if (test.type === "CUSTOM") {
        let correctCount = 0;
        for (const q of test.questions) {
          const given = String(responses[q.id] || "").trim();
          const correct = String(q.respuestaCorrecta).trim();
          if (given.toLowerCase() === correct.toLowerCase()) correctCount++;
        }

        setFinishState({
          rectified: 0,
          correct: correctCount,
          total: test.questions.length,
        });
        setIsSubmitting(false);
        return;
    }

    const timeSpentSeconds = TOTAL_TIME - timeLeft;

    try {
      const res = await fetch("/api/student/driving-tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test.id, responses, timeSpentSeconds }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      toast.success("Test finalizado correctamente");
      router.push(`/estudiante/driving-tests/resultados/${data.id}`);
    } catch (error) {
      toast.error("Error al guardar el test");
      setIsSubmitting(false);
    }
  }, [isSubmitting, test.id, test.type, test.questions, responses, router, timeLeft, TOTAL_TIME]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleFinish]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = test.questions[currentIndex];

  if (finishState) {
    const isCustom = test.type === "CUSTOM";
    const score = Math.round((finishState.correct / finishState.total) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 bg-surface p-12 rounded-[2.5rem] border border-slate-700/50">
        <div className={`w-24 h-24 ${isCustom ? "bg-brand/20" : "bg-green-500/10"} rounded-full flex items-center justify-center ${isCustom ? "text-brand-light" : "text-green-400"} mb-4 animate-bounce`}>
          <Check size={48} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-50 mb-2">
            {isCustom ? "¡Test Personalizado Completado!" : "¡Repaso Completado!"}
          </h2>
          {isCustom ? (
            <>
              <p className="text-slate-400 font-medium text-lg">
                Has obtenido un <span className="text-brand-light font-bold">{score}%</span> de aciertos.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Aciertos: {finishState.correct}/{finishState.total}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Este test no afecta a tus estadísticas.
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-400 font-medium text-lg">
                Has eliminado <span className="text-green-400 font-bold">{finishState.rectified}</span> errores de tu historial.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Aciertos: {finishState.correct}/{finishState.total}
              </p>
            </>
          )}
        </div>
        <button
          onClick={() => router.push("/estudiante/driving-tests")}
          className="bg-accent text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-accent-light transition shadow-xl shadow-accent/20"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-surface p-6 rounded-3xl border border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-100">{test.topic?.name || test.name}</h2>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black ${
            timeLeft < 300
              ? "bg-red-500/10 text-red-400 animate-pulse"
              : "bg-accent/10 text-accent"
          }`}
        >
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-surface p-10 rounded-[2.5rem] border border-slate-700/50 min-h-[400px] flex flex-col relative">
        {isSubmitting && (
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[2.5rem]">
            <Loader2 className="animate-spin text-accent mb-4" size={40} />
            <p className="font-bold text-slate-100">Procesando respuestas...</p>
          </div>
        )}
        <span className="text-xs font-black text-accent mb-4 uppercase tracking-widest">
          Pregunta {currentIndex + 1} de {test.questions.length}
        </span>
        <h3 className="text-2xl font-bold text-slate-100 mb-8">
          {currentQuestion.enunciado}
        </h3>
        <div className="grid gap-4">
          {Object.entries(
            currentQuestion.opciones as Record<string, string>
          ).map(([letra, texto]) => (
            <button
              key={letra}
              onClick={() =>
                setResponses({ ...responses, [currentQuestion.id]: texto })
              }
              className={`p-6 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer ${
                responses[currentQuestion.id] === texto
                  ? "border-accent bg-accent/10 text-accent shadow-sm"
                  : "border-slate-700/50 hover:border-slate-600 text-slate-300"
              }`}
            >
              <span className="mr-4 opacity-50">{letra})</span> {texto}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto max-w-md pb-2">
          {test.questions.map((q: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-10 h-10 rounded-xl font-bold flex-shrink-0 transition ${
                currentIndex === i
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : responses[q.id]
                  ? "bg-green-500/20 text-green-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(0)}
            className="p-4 border border-slate-600 rounded-2xl hover:bg-slate-800 text-slate-300 cursor-pointer transition"
          >
            <ChevronsLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            className="p-4 border border-slate-600 rounded-2xl hover:bg-slate-800 text-slate-300 cursor-pointer transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              setCurrentIndex(
                Math.min(test.questions.length - 1, currentIndex + 1)
              )
            }
            className="p-4 border border-slate-600 rounded-2xl hover:bg-slate-800 text-slate-300 cursor-pointer transition"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex(test.questions.length - 1)}
            className="p-4 border border-slate-600 rounded-2xl hover:bg-slate-800 text-slate-300 cursor-pointer transition"
          >
            <ChevronsRight size={20} />
          </button>

          {currentIndex === test.questions.length - 1 && (
            <button
              onClick={handleFinish}
              className="bg-green-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-green-600 transition cursor-pointer shadow-lg shadow-green-500/20"
            >
              <Send size={18} /> Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
