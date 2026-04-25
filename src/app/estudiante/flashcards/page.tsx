"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Layers,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import CreateDeckModal from "@/components/flashcards/CreateDeckModal";
import { toast } from "sonner";

interface Deck {
  id: string;
  name: string;
  topicName: string;
  createdAt: string;
  _count: { cards: number };
}

const POLL_INTERVAL = 30_000;

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const deckIdsRef = useRef<Set<string>>(new Set());

  const fetchDecks = useCallback(async () => {
    try {
      const res = await fetch("/api/student/flashcards");
      if (res.ok) {
        const data: Deck[] = await res.json();
        setDecks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Keep ref in sync with current decks for polling comparison
  useEffect(() => {
    deckIdsRef.current = new Set(decks.map((d) => d.id));
  }, [decks]);

  // Silent polling: detects new decks without a full reload
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/student/flashcards");
        if (!res.ok) return;
        const fresh: Deck[] = await res.json();
        const hasNew = fresh.some((d) => !deckIdsRef.current.has(d.id));
        if (hasNew) {
          setDecks(fresh);
          toast.info("Nuevas baterías añadidas automáticamente");
        }
      } catch {
        // silent — no toast on background poll failure
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (deckId: string, deckName: string) => {
    if (!confirm(`¿Eliminar la batería "${deckName}"?`)) return;
    try {
      const res = await fetch(`/api/student/flashcards/${deckId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Batería eliminada");
        fetchDecks();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleCreated = () => {
    toast.success("¡Batería de flashcards generada con éxito!");
    fetchDecks();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight">
            Flashcards 🃏
          </h1>
          <p className="text-slate-400 font-medium">
            Repasa conceptos clave con tarjetas interactivas generadas por IA.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus size={18} />
          Nueva Batería
        </button>
      </header>

      <CreateDeckModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />

      {decks.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-slate-700/50">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">
            No tienes baterías de flashcards
          </p>
          <p className="text-slate-500 text-sm">
            Pulsa &quot;Nueva Batería&quot; para generar tu primer lote.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="bg-surface rounded-[2.5rem] border border-slate-700/50 hover:border-amber-500/30 hover:-translate-y-1 transition-all group overflow-hidden"
            >
              <Link
                href={`/estudiante/flashcards/${deck.id}`}
                className="block p-6 pb-0"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <Layers size={28} />
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {deck._count.cards} Tarjetas
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-1 leading-tight">
                  {deck.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
                  <BookOpen size={14} />
                  {deck.topicName}
                </div>
              </Link>

              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/30">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                  <Calendar size={14} />
                  {new Date(deck.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(deck.id, deck.name);
                  }}
                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
