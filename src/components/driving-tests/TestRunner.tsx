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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TestRunner({ test }: { test: any }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/student/driving-tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test.id, responses }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      toast.success("Test finalizado correctamente");
      router.push(`/estudiante/driving-tests/resultados/${data.id}`);
    } catch (error) {
      toast.error("Error al guardar el test");
      setIsSubmitting(false);
    }
  }, [isSubmitting, test.id, responses, router]);

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">{test.topic.name}</h2>
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
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(0)}
            className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition"
          >
            <ChevronsLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              setCurrentIndex(
                Math.min(test.questions.length - 1, currentIndex + 1)
              )
            }
            className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex(test.questions.length - 1)}
            className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition"
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
