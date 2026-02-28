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
    const syncAndFetchTopics = async () => {
      try {
        await fetch("/api/admin/topics/sync", { method: "POST" });
      } catch (error) {
        console.log("Sync con IA no disponible, usando topics locales");
      }

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
    syncAndFetchTopics();
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
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-xl overflow-hidden border border-slate-700/50">
        <div className="h-2 bg-gradient-to-r from-brand via-brand-light to-brand" />

        <div className="p-8 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-6 rounded-full bg-slate-800 flex items-center justify-center border-4 border-surface shadow-md">
            <Image
              src="/generate.png"
              alt="Generar"
              width={80}
              height={80}
              className="object-contain"
            />
            <div className="absolute bottom-0 right-2 bg-accent p-1.5 rounded-lg shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-50 mb-1">
            Generar Test AI
          </h1>
          <p className="text-slate-400 text-sm mb-8">Panel de Administración</p>

          <div className="w-full space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1 text-center block">
                Selecciona el Tema
              </label>
              <div className="relative">
                <BookOpen
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10"
                />
                <select
                  disabled={fetchingTopics || loading}
                  className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-accent appearance-none outline-none transition-all text-slate-200 disabled:opacity-50"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1 text-center block">
                Número de preguntas
              </label>
              <div className="relative">
                <Hash
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all text-slate-200"
                  value={isNaN(numQuestions) ? "" : numQuestions}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNumQuestions(val === "" ? NaN : parseInt(val));
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-highlight/10 p-4 rounded-xl border border-highlight/20">
              <AlertCircle size={20} className="text-highlight shrink-0" />
              <p className="text-xs text-highlight/80 leading-tight">
                La generación puede tardar unos minutos. Por favor, ten
                paciencia.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || fetchingTopics}
              className="w-full bg-accent hover:bg-accent-light text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
