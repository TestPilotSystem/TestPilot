"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface Topic {
  name: string;
}

export default function CreateDeckModal({
  isOpen,
  onClose,
  onCreated,
}: CreateDeckModalProps) {
  const [name, setName] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingTopics(true);
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.topics || [];
        setTopics(list);
        if (list.length > 0 && !topicName) {
          setTopicName(list[0].name);
        }
      })
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false));
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim() || !topicName) return;
    setLoading(true);
    try {
      const res = await fetch("/api/student/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), topicName }),
      });
      if (res.ok) {
        setName("");
        onCreated();
        onClose();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Error al generar flashcards");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E293B] rounded-3xl border border-slate-700/50 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Nueva Batería</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">
              Nombre de la batería
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Repaso señales"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/30 transition font-medium"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">
              Tema
            </label>
            {loadingTopics ? (
              <div className="flex items-center gap-2 text-slate-500 py-3">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Cargando temas...</span>
              </div>
            ) : (
              <select
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 transition font-medium appearance-none"
                disabled={loading}
              >
                {topics.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Se generarán 20 flashcards con IA sobre el tema seleccionado.
            Límite: 2 generaciones por hora.
          </p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700/50 text-slate-400 font-bold text-sm hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !topicName}
            className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
