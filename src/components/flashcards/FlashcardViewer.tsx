"use client";

import { useState, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, RotateCcw, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import FlashcardCard from "./FlashcardCard";

interface Card {
  id: string;
  pregunta: string;
  respuesta: string;
  explicacion: string;
}

interface FlashcardViewerProps {
  deckName: string;
  cards: Card[];
}

export default function FlashcardViewer({ deckName, cards }: FlashcardViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalCards = cards.length;
  const isCompleted = currentIndex >= totalCards;

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.min(prev + 1, totalCards));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, totalCards]);

  const goPrev = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, currentIndex]);

  const restart = () => {
    setCurrentIndex(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStartX(e.clientX);
    setDragDelta(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX === null) return;
    setDragDelta(e.clientX - dragStartX);
  };

  const handlePointerUp = () => {
    if (dragStartX === null) return;
    const threshold = 80;
    if (dragDelta < -threshold) {
      goNext();
    } else if (dragDelta > threshold) {
      goPrev();
    }
    setDragStartX(null);
    setDragDelta(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setDragDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    setDragDelta(e.touches[0].clientX - dragStartX);
  };

  const handleTouchEnd = () => {
    if (dragStartX === null) return;
    const threshold = 80;
    if (dragDelta < -threshold) {
      goNext();
    } else if (dragDelta > threshold) {
      goPrev();
    }
    setDragStartX(null);
    setDragDelta(0);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f1e] z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 md:p-6">
        <button
          onClick={() => router.push("/estudiante/flashcards")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition px-3 py-2 rounded-xl hover:bg-slate-800/50"
        >
          <X size={20} />
          <span className="text-sm font-semibold hidden sm:inline">Salir</span>
        </button>

        <h2 className="text-slate-300 font-bold text-sm md:text-base truncate max-w-[50%]">
          {deckName}
        </h2>

        <div className="text-slate-500 text-sm font-bold tabular-nums">
          {isCompleted ? totalCards : currentIndex + 1} / {totalCards}
        </div>
      </div>

      <div className="w-full px-6">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((isCompleted ? totalCards : currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center px-6 py-8 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="transition-transform duration-200"
          style={{
            transform: dragStartX !== null ? `translateX(${dragDelta * 0.3}px)` : "none",
          }}
        >
          {isCompleted ? (
            <div className="w-[85vw] max-w-2xl h-[65vh] max-h-[520px] rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-10 md:p-14 flex flex-col items-center justify-center shadow-2xl shadow-orange-900/40 border border-orange-400/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
              <PartyPopper size={64} className="text-white mb-6 z-10" />
              <h3 className="text-white text-2xl md:text-3xl font-black text-center mb-4 z-10">
                ¡Lote completado!
              </h3>
              <p className="text-orange-100/80 text-center text-sm md:text-base font-medium mb-8 z-10">
                Has repasado las {totalCards} tarjetas de esta batería.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restart();
                }}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm transition z-10 backdrop-blur-sm"
              >
                <RotateCcw size={16} />
                Repetir
              </button>
            </div>
          ) : (
            cards.map((card, i) => (
              <FlashcardCard
                key={card.id}
                pregunta={card.pregunta}
                respuesta={card.respuesta}
                explicacion={card.explicacion}
                isActive={i === currentIndex}
              />
            ))
          )}
        </div>
      </div>

      {!isCompleted && (
        <div className="flex items-center justify-center gap-8 pb-8">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
