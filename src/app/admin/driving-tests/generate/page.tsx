"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  BookOpen,
  Hash,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface Topic {
  id: string;
  name: string;
}

export default function GenerateTestPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [loading, setLoading] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics");
        const data = await res.json();
        setTopics(data);
      } catch (error) {
        toast.error("Error al cargar los temas");
      } finally {
        setFetchingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  const handleGenerate = async () => {
    if (!selectedTopic) {
      toast.error("Por favor, selecciona un tema");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/driving-tests/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: selectedTopic.name,
          numQuestions,
          topicId: selectedTopic.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al generar");

      toast.success("¡Test generado y guardado correctamente!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Toaster richColors position="top-right" />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400" />

        <div className="p-8 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-6 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-md">
            <Image
              src="/generate.png"
              alt="Generar"
              width={80}
              height={80}
              className="object-contain"
            />
            <div className="absolute bottom-0 right-2 bg-yellow-500 p-1.5 rounded-lg shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Generar Test AI
          </h1>
          <p className="text-gray-500 text-sm mb-8">Panel de Administración</p>

          <div className="w-full space-y-5">
            {/* Dropdown de Temas */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 text-center block">
                Selecciona el Tema
              </label>
              <div className="relative">
                <BookOpen
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                />
                <select
                  disabled={fetchingTopics || loading}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 appearance-none outline-none transition-all text-gray-700 disabled:opacity-50"
                  onChange={(e) => {
                    const topic = topics.find((t) => t.id === e.target.value);
                    if (topic) setSelectedTopic(topic);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {fetchingTopics ? "Cargando temas..." : "Elegir tema..."}
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Input Número de preguntas */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 text-center block">
                Número de preguntas
              </label>
              <div className="relative">
                <Hash
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all text-gray-700"
                  value={isNaN(numQuestions) ? "" : numQuestions}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNumQuestions(val === "" ? NaN : parseInt(val));
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <AlertCircle size={20} className="text-orange-500 shrink-0" />
              <p className="text-xs text-orange-700 leading-tight">
                La generación puede tardar unos minutos. Por favor, ten
                paciencia.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || fetchingTopics}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Generar Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
