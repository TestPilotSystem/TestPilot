"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Loader2, CheckCircle2, XCircle, HelpCircle, Home } from "lucide-react";

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <Loader2 className="animate-spin text-yellow-600" size={40} />
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
    <div className="flex-1 min-h-screen bg-[#fafafa]">
      <DashboardHeader />
      <main className="p-8 flex flex-col items-center">
        <div className="max-w-4xl w-full bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm text-center">
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Resultado del Test
          </h1>
          <p className="text-gray-400 font-bold mb-12 uppercase tracking-widest text-sm">
            {data.test.topic.name}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div
                className="w-64 h-64 rounded-full relative flex items-center justify-center"
                style={{
                  background: `conic-gradient(#22c55e 0deg ${angleCorrectas}deg, #ef4444 ${angleCorrectas}deg ${angleFalladas}deg, #e5e7eb ${angleFalladas}deg 360deg)`,
                }}
              >
                <div className="w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-gray-800">
                    {data.score}%
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                    Puntuación Final
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" />
                  <span className="font-bold text-green-800">Acertadas</span>
                </div>
                <span className="text-xl font-black text-green-600">
                  {correctas}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-600" />
                  <span className="font-bold text-red-800">Falladas</span>
                </div>
                <span className="text-xl font-black text-red-600">
                  {falladas}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <HelpCircle className="text-gray-400" />
                  <span className="font-bold text-gray-600">En blanco</span>
                </div>
                <span className="text-xl font-black text-gray-400">
                  {blanco}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/estudiante/inicio")}
            className="mt-12 bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 mx-auto transition shadow-lg shadow-yellow-100 cursor-pointer"
          >
            <Home size={20} /> Volver al menú principal
          </button>
        </div>
      </main>
    </div>
  );
}
