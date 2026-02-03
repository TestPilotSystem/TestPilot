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
  }, [isSubmitting, test.id, test.type, responses, router, timeLeft]);

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
          <Check size={48} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">¡Repaso Completado!</h2>
          <p className="text-gray-500 font-medium text-lg">
            Has eliminado <span className="text-green-600 font-bold">{finishState.rectified}</span> errores de tu historial.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Aciertos: {finishState.correct}/{finishState.total}
          </p>
        </div>
        <button
          onClick={() => router.push("/estudiante/driving-tests")}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">{test.topic?.name || test.name}</h2>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black ${
            timeLeft < 300
              ? "bg-red-50 text-red-600 animate-pulse"
              : "bg-yellow-50 text-yellow-600"
          }`}
        >
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative">
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[2.5rem]">
            <Loader2 className="animate-spin text-yellow-600 mb-4" size={40} />
            <p className="font-bold text-gray-800">Procesando respuestas...</p>
          </div>
        )}
        <span className="text-xs font-black text-yellow-600 mb-4 uppercase tracking-widest">
          Pregunta {currentIndex + 1} de {test.questions.length}
        </span>
        <h3 className="text-2xl font-bold text-gray-800 mb-8">
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
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm"
                  : "border-gray-50 hover:border-gray-200 text-gray-600"
              }`}
            >
              <span className="mr-4 opacity-50">{letra})</span> {texto}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto max-w-md pb-2">
          {test.questions.map((q: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-10 h-10 rounded-xl font-bold flex-shrink-0 transition ${
                currentIndex === i
                  ? "bg-yellow-600 text-white shadow-lg"
                  : responses[q.id]
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(0)}
            className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-100 text-gray-800 cursor-pointer transition"
          >
            <ChevronsLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-100 text-gray-800 cursor-pointer transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              setCurrentIndex(
                Math.min(test.questions.length - 1, currentIndex + 1)
              )
            }
            className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-100 text-gray-800 cursor-pointer transition"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex(test.questions.length - 1)}
            className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-100 text-gray-800 cursor-pointer transition"
          >
            <ChevronsRight size={20} />
          </button>

          {currentIndex === test.questions.length - 1 && (
            <button
              onClick={handleFinish}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-green-700 transition cursor-pointer shadow-lg"
            >
              <Send size={18} /> Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
