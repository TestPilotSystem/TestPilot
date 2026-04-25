"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Home,
  ChevronDown,
  ChevronUp,
  MinusCircle,
} from "lucide-react";

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    fetch(`/api/student/driving-tests/results/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );

  const total = data.responses.length;
  const correctas = data.responses.filter((r: any) => r.esCorrecta).length;
  const falladas = data.responses.filter(
    (r: any) => !r.esCorrecta && r.respuestaDada !== ""
  ).length;
  const blanco = total - (correctas + falladas);

  const angleCorrectas = (correctas / total) * 360;
  const angleFalladas = (falladas / total) * 360 + angleCorrectas;

  return (
    <div className="flex-1 min-h-screen">
      <main className="p-8 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-6">
          <div className="bg-surface p-12 rounded-[3rem] border border-slate-700/50 text-center">
            <h1 className="text-3xl font-black text-slate-50 mb-2">
              Resultado del Test
            </h1>
            <p className="text-slate-500 font-bold mb-12 uppercase tracking-widest text-sm">
              {data.test.topic?.name ?? "Sin tema"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <div
                  className="w-64 h-64 rounded-full relative flex items-center justify-center"
                  style={{
                    background: `conic-gradient(#22c55e 0deg ${angleCorrectas}deg, #ef4444 ${angleCorrectas}deg ${angleFalladas}deg, #334155 ${angleFalladas}deg 360deg)`,
                  }}
                >
                  <div className="w-48 h-48 bg-[#0F172A] rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-5xl font-black text-slate-50">
                      {data.score}%
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      Puntuación Final
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400" />
                    <span className="font-bold text-green-400">Acertadas</span>
                  </div>
                  <span className="text-xl font-black text-green-400">
                    {correctas}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <XCircle className="text-red-400" />
                    <span className="font-bold text-red-400">Falladas</span>
                  </div>
                  <span className="text-xl font-black text-red-400">
                    {falladas}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="text-slate-500" />
                    <span className="font-bold text-slate-400">En blanco</span>
                  </div>
                  <span className="text-xl font-black text-slate-500">
                    {blanco}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setShowReview(!showReview)}
                className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-bold transition cursor-pointer"
              >
                {showReview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                {showReview ? "Ocultar respuestas" : "Ver respuestas"}
              </button>
              <button
                onClick={() => router.push("/estudiante/inicio")}
                className="bg-accent hover:bg-accent-light text-white px-10 py-3 rounded-2xl font-black flex items-center gap-3 transition shadow-lg shadow-accent/20 cursor-pointer"
              >
                <Home size={20} /> Volver al menú principal
              </button>
            </div>
          </div>

          {showReview && (
            <div className="space-y-4">
              {data.responses.map((r: any, i: number) => (
                <div
                  key={r.id}
                  className={`bg-surface p-6 rounded-2xl border ${
                    r.respuestaDada === ""
                      ? "border-slate-600/50"
                      : r.esCorrecta
                      ? "border-green-500/30"
                      : "border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 shrink-0 ${
                        r.respuestaDada === ""
                          ? "text-slate-500"
                          : r.esCorrecta
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {r.respuestaDada === "" ? (
                        <MinusCircle size={22} />
                      ) : r.esCorrecta ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <XCircle size={22} />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Pregunta {i + 1}
                      </p>
                      <p className="text-slate-100 font-semibold">
                        {r.question.enunciado}
                      </p>
                      {r.respuestaDada === "" ? (
                        <p className="text-sm text-slate-500 italic">
                          Sin respuesta
                        </p>
                      ) : r.esCorrecta ? (
                        <p className="text-sm text-green-400 font-medium">
                          Tu respuesta: {r.respuestaDada} ✓
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-red-400 font-medium line-through opacity-70">
                            Tu respuesta: {r.respuestaDada}
                          </p>
                          <p className="text-sm text-green-400 font-medium">
                            Respuesta correcta: {r.question.respuestaCorrecta}
                          </p>
                        </div>
                      )}
                      {r.question.explicacion && (
                        <p className="text-sm text-slate-400 bg-slate-800/50 rounded-xl p-3 leading-relaxed">
                          {r.question.explicacion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
