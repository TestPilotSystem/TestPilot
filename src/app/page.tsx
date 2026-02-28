import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-brand-light font-black italic shadow-lg shadow-brand/20">
            T
          </div>
          <span className="text-xl font-black text-slate-50 tracking-tighter">Test Pilot</span>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-12 py-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-2 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-light">Plataforma de Educación Premium</span>
          </div>

          <h1 className="text-7xl font-black text-slate-50 leading-[1.1] tracking-tighter">
            Impulsando a los <br />
            <span className="text-accent-light">Futuros Conductores</span> con confianza.
          </h1>

          <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
            La herramienta definitiva para preparar tus exámenes teóricos.
            Tests generados por IA, seguimiento detallado y una experiencia de aprendizaje sin interrupciones.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <Link
              href="/register"
              className="bg-accent text-white px-10 py-5 rounded-[1.5rem] font-bold hover:bg-accent-light transition shadow-lg shadow-accent/20 flex items-center gap-3"
            >
              Registrarse <TrendingUp size={18} className="text-white" />
            </Link>
            <Link
              href="/login"
              className="bg-surface text-slate-100 border border-slate-700/50 px-10 py-5 rounded-[1.5rem] font-bold hover:bg-slate-800 transition shadow-sm text-center"
            >
              Acceder
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CheckCircle2 size={16} className="text-brand-light" /> Contenido Certificado
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Sparkles size={16} className="text-brand-light" /> Asistencia por IA
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <TrendingUp size={16} className="text-brand-light" /> 98% de Aprobados
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-brand/20 blur-3xl rounded-full"></div>
          <Image
            src="/cover.png"
            alt="Simulación de Examen Test Pilot"
            width={800}
            height={600}
            className="relative rounded-[2.5rem] shadow-2xl border border-slate-700/50"
            priority
          />
        </div>
      </main>
    </div>
  );
}