import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center text-white font-black italic">
            T
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tighter">Test Pilot</span>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-12 py-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-4 py-2 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Plataforma de Educación Premium</span>
          </div>

          <h1 className="text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter">
            Impulsando a los <br />
            <span className="text-[#d4af37]">Futuros Conductores</span> con confianza.
          </h1>

          <p className="text-lg text-gray-500 font-medium max-w-md leading-relaxed">
            La herramienta definitiva para preparar tus exámenes teóricos.
            Tests generados por IA, seguimiento detallado y una experiencia de aprendizaje sin interrupciones.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <Link
              href="/register"
              className="bg-gray-900 text-white px-10 py-5 rounded-[1.5rem] font-bold hover:bg-black transition shadow-2xl shadow-gray-200 flex items-center gap-3"
            >
              Registrarse <TrendingUp size={18} className="text-yellow-400" />
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-800 border border-gray-100 px-10 py-5 rounded-[1.5rem] font-bold hover:bg-gray-50 transition shadow-sm text-center"
            >
              Acceder
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-10">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <CheckCircle2 size={16} className="text-[#d4af37]" /> Contenido Certificado
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <Sparkles size={16} className="text-[#d4af37]" /> Asistencia por IA
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <TrendingUp size={16} className="text-[#d4af37]" /> 98% de Aprobados
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-yellow-200/20 blur-3xl rounded-full"></div>
          <Image
            src="/cover.png"
            alt="Simulación de Examen Test Pilot"
            width={800}
            height={600}
            className="relative rounded-[2.5rem] shadow-2xl border border-white"
            priority
          />
        </div>
      </main>
    </div>
  );
}