"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Users,
  FileCheck,
  MessageCircleQuestion,
  Target,
  Star,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Zap,
} from "lucide-react";

interface Stats {
  totalStudents: number;
  totalTests: number;
  totalResponses: number;
  successRate: number;
  avgScore: number;
  totalTopics: number;
}

function AnimatedCounter({
  target,
  suffix = "",
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    motionValue.set(target);
  }, [target, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplay(Math.floor(latest).toLocaleString("es-ES") + suffix);
    });
  }, [spring, suffix]);

  return <span>{display}</span>;
}

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  sublabel,
  color,
  delay,
}: {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-[2rem] p-8 hover:border-slate-600/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color} blur-3xl scale-75`}
      />
      <div className="relative">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color.replace("bg-", "bg-").replace("/10", "/20")} border border-white/5`}
        >
          <Icon size={26} className="text-white/80" />
        </div>
        <div className="text-5xl font-black text-white tracking-tight mb-2">
          {inView ? <AnimatedCounter target={value} suffix={suffix} /> : "0"}
        </div>
        <p className="text-lg font-bold text-slate-200">{label}</p>
        <p className="text-sm text-slate-500 mt-1">{sublabel}</p>
      </div>
    </motion.div>
  );
}

function SuccessRing({ rate }: { rate: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const angle = (rate / 100) * 360;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-center"
    >
      <div
        className="w-56 h-56 rounded-full flex items-center justify-center relative"
        style={{
          background: inView
            ? `conic-gradient(#3b82f6 0deg ${angle}deg, #1e293b ${angle}deg 360deg)`
            : "conic-gradient(#1e293b 0deg 360deg)",
          transition: "background 2s ease",
        }}
      >
        <div className="w-44 h-44 bg-[#0F172A] rounded-full flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white">
            {inView ? <AnimatedCounter target={rate} suffix="%" /> : "0%"}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Tasa de acierto
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const data = stats ?? {
    totalStudents: 0,
    totalTests: 0,
    totalResponses: 0,
    successRate: 0,
    avgScore: 0,
    totalTopics: 0,
  };

  const cards = [
    {
      icon: Users,
      value: data.totalStudents,
      label: "Estudiantes activos",
      sublabel: "Formándose en la plataforma",
      color: "bg-blue-500/10",
      delay: 0,
    },
    {
      icon: FileCheck,
      value: data.totalTests,
      label: "Tests completados",
      sublabel: "Sesiones de práctica finalizadas",
      color: "bg-green-500/10",
      delay: 0.08,
    },
    {
      icon: MessageCircleQuestion,
      value: data.totalResponses,
      label: "Preguntas respondidas",
      sublabel: "Cada respuesta es un paso más",
      color: "bg-purple-500/10",
      delay: 0.16,
    },
    {
      icon: Star,
      value: data.avgScore,
      suffix: "%",
      label: "Puntuación media",
      sublabel: "Promedio global de los estudiantes",
      color: "bg-yellow-500/10",
      delay: 0.24,
    },
    {
      icon: BookOpen,
      value: data.totalTopics,
      label: "Temas disponibles",
      sublabel: "Bloques de contenido certificado",
      color: "bg-pink-500/10",
      delay: 0.32,
    },
    {
      icon: Zap,
      value: data.successRate,
      suffix: "%",
      label: "Tasa de acierto global",
      sublabel: "Del total de respuestas emitidas",
      color: "bg-accent/10",
      delay: 0.4,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50">
      <Navbar />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-blue-500/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative pt-32 pb-24 px-6 max-w-6xl mx-auto">

        {/* Hero */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-20"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">
              Datos en tiempo real · Actualizados constantemente
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6"
          >
            Los números{" "}
            <span className="text-accent-light">hablan</span>
            <br />
            por sí solos.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed"
          >
            Únete a una comunidad de conductores que ya confían en TestPilot
            para superar el examen teórico con éxito.
          </motion.p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Success spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-60px" }}
          className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-[2.5rem] p-10 md:p-16 mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                <Target size={14} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  Rendimiento global
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter leading-tight">
                Nuestros estudiantes{" "}
                <span className="text-blue-400">aciertan más</span> con cada
                sesión.
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                La práctica constante con tests reales de examen marca la
                diferencia. La plataforma adapta el contenido a tus errores
                para que cada sesión sea más efectiva que la anterior.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <TrendingUp size={20} className="text-green-400" />
                <span className="text-sm font-bold text-green-400">
                  Mejora progresiva garantizada con cada test
                </span>
              </div>
            </div>
            <SuccessRing rate={data.successRate} />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">
              ¿Listo para unirte?
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-md mx-auto">
              Empieza gratis hoy y sé parte de estos números.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-white px-10 py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-accent/20"
            >
              Crear cuenta gratis <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-200 px-10 py-4 rounded-2xl font-bold text-lg border border-slate-700/50 transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
