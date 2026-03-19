"use client";

import { useState } from "react";

interface FlashcardCardProps {
  pregunta: string;
  respuesta: string;
  explicacion: string;
  isActive: boolean;
}

export default function FlashcardCard({
  pregunta,
  respuesta,
  explicacion,
  isActive,
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isActive) return null;

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className="w-[85vw] max-w-2xl h-[65vh] max-h-[520px] cursor-pointer select-none"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 md:p-14 flex flex-col items-center justify-center shadow-2xl shadow-blue-900/40 border border-blue-500/20 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
          <div className="absolute top-5 left-6 text-blue-300/40 text-xs font-bold uppercase tracking-widest">
            Pregunta
          </div>
          <p className="text-white text-lg md:text-xl lg:text-2xl font-bold text-center leading-relaxed z-10 px-2">
            {pregunta}
          </p>
          <p className="absolute bottom-6 text-blue-200/40 text-xs font-medium z-10">
            Toca para ver la respuesta
          </p>
        </div>

        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-10 md:p-14 flex flex-col items-center justify-center shadow-2xl shadow-emerald-900/40 border border-emerald-500/20 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
          <div className="absolute top-5 left-6 text-emerald-300/40 text-xs font-bold uppercase tracking-widest">
            Respuesta
          </div>
          <div className="z-10 space-y-5 text-center px-2 max-h-[80%] overflow-y-auto">
            <p className="text-white text-lg md:text-xl font-bold leading-relaxed">
              {respuesta}
            </p>
            <div className="w-12 h-px bg-white/20 mx-auto" />
            <p className="text-emerald-100/60 text-sm md:text-base leading-relaxed font-medium">
              {explicacion}
            </p>
          </div>
          <p className="absolute bottom-6 text-emerald-200/40 text-xs font-medium z-10">
            Toca para ver la pregunta
          </p>
        </div>
      </div>
    </div>
  );
}
