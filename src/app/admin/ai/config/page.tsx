"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2, Check, MessageSquare, User, RefreshCw, BookOpen, Info } from "lucide-react";
import { toast, Toaster } from "sonner";

const TONE_OPTIONS = [
  { value: "formal", label: "Formal", description: "Trato respetuoso y profesional" },
  { value: "informal", label: "Informal", description: "Trato cercano y amigable" },
  { value: "conciso", label: "Conciso", description: "Respuestas breves y directas" },
  { value: "detallado", label: "Detallado", description: "Explicaciones extensas y completas" },
];

export default function AIConfigPage() {
  const [tone, setTone] = useState("formal");
  const [useStudentNames, setUseStudentNames] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/admin/ai/config");
        if (response.ok) {
          const data = await response.json();
          setTone(data.tone);
          setUseStudentNames(data.useStudentNames);
        }
      } catch (error) {
        toast.error("Error al cargar la configuración");
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, useStudentNames }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Error al guardar la configuración");
        return;
      }
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncTopics = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/admin/topics/sync", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "No se pudo sincronizar con el servicio de IA");
        return;
      }

      if (data.synced > 0) {
        toast.success(`${data.synced} nuevos topics sincronizados`);
      } else {
        toast.info("Topics actualizados, no hay nuevos temas");
      }
    } catch (error) {
      toast.error("Error al conectar con el servicio de IA");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <Toaster richColors />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-50 tracking-tight">
          Configuración del Tutor IA
        </h1>
        <p className="text-slate-400 font-medium">
          Personaliza cómo interactúa la IA con los estudiantes.
        </p>
      </div>

      <div className="bg-surface p-10 rounded-[2.5rem] border border-slate-700/50 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand/20 rounded-2xl text-brand-light">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Tono de conversación</h2>
              <p className="text-sm text-slate-400">
                Define el estilo de comunicación del tutor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTone(option.value)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  tone === option.value
                    ? "border-accent bg-accent/10"
                    : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-100">{option.label}</span>
                  {tone === option.value && (
                    <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent-light">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Personalización</h2>
                <p className="text-sm text-slate-400">
                  La IA se dirigirá a los estudiantes por su nombre
                </p>
              </div>
            </div>

            <button
              onClick={() => setUseStudentNames(!useStudentNames)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                useStudentNames ? "bg-accent" : "bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  useStudentNames ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Sincronizar Topics</h2>
                <p className="text-sm text-slate-400">
                  Actualizar los temas disponibles desde el servicio de IA
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncTopics}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl font-medium hover:bg-green-500/20 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Sincronizando..." : "Refrescar"}
            </button>
          </div>

          <div className="bg-accent/10 p-4 rounded-xl flex items-start gap-3 text-accent-light text-xs font-medium border border-accent/20">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              Si existen topics en el servicio de IA que no fueron registrados a través de TestPilot,
              no aparecerán como opción hasta sincronizar manualmente.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-accent text-white p-5 rounded-2xl font-black text-lg hover:bg-accent-light transition shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Settings size={20} />
        )}
        {isSaving ? "Guardando..." : "Guardar Configuración"}
      </button>
    </div>
  );
}
