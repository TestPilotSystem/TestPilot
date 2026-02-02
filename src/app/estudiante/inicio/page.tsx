"use client";

import {
  BookOpen,
  XCircle,
  Layout,
  ChevronRight,
  Trophy,
  Target,
  Clock,
  Sparkles,
  MessageSquare,
  BarChart2,
} from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="flex-1 min-h-screen bg-[#fafafa]">
      <main className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                    Test de Conducción 🚗
                  </h2>
                </div>
                <button className="text-sm font-bold text-yellow-600 hover:underline cursor-pointer">
                  Ver Todos
                </button>
              </div>

              {/* Tabs de tipos de tests */}
              <div className="flex gap-6 border-b border-gray-50 mb-8 overflow-x-auto pb-1">
                {[
                  "Tests Convencionales 📚",
                  "Tests de Errores ❌",
                  "Test Personalizado 📝",
                ].map((tab, i) => (
                  <button
                    key={tab}
                    className={`pb-4 text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      i === 0
                        ? "text-yellow-600 border-b-2 border-yellow-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Lista de Tests (Placeholder) */}
              <div className="space-y-4">
                {[
                  {
                    name: "Road Signs & Signals",
                    desc: "Covers all mandatory and warning signs.",
                    icon: "🚦",
                    color: "bg-blue-50 text-blue-500",
                  },
                  {
                    name: "Priority & Right of Way",
                    desc: "Intersection rules and yielding.",
                    icon: "🛑",
                    color: "bg-red-50 text-red-500",
                  },
                  {
                    name: "Speed & Control",
                    desc: "Speed regulations in different zones.",
                    icon: "⚡",
                    color: "bg-green-50 text-green-500",
                  },
                ].map((test) => (
                  <div
                    key={test.name}
                    className="flex items-center justify-between p-4 border border-gray-50 rounded-3xl hover:border-yellow-100 hover:bg-yellow-50/30 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${test.color} rounded-2xl flex items-center justify-center text-xl`}
                      >
                        {test.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{test.name}</h4>
                        <p className="text-xs text-gray-400">{test.desc}</p>
                      </div>
                    </div>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition cursor-pointer shadow-sm shadow-yellow-100">
                      Empezar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Tutor Virtual */}
            <div className="bg-yellow-50/50 p-8 rounded-[2.5rem] border border-yellow-100 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-3 z-10 max-w-md">
                <div className="flex items-center gap-2 text-yellow-700">
                  <Sparkles size={18} />
                  <span className="font-bold text-sm uppercase tracking-wider">
                    Consultar Tutor Virtual 🧑‍🏫
                  </span>
                </div>
                <p className="text-sm text-yellow-800/70 font-medium">
                  Obten ayuda personalizada y resuelve tus dudas de conducción
                  al instante.
                </p>
                <button className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-yellow-600 transition shadow-lg shadow-yellow-200 cursor-pointer">
                  <MessageSquare size={16} /> Preguntar al Tutor
                </button>
              </div>
              <div className="hidden md:block opacity-10 rotate-12">
                <BookOpen size={120} className="text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <BarChart2 size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  Progreso 📈
                </h2>
              </div>

              {/* Tarjetas de progreso (mock) */}
              <div className="space-y-6">
                {[
                  {
                    label: "Test totales",
                    val: "25",
                    icon: Trophy,
                    color: "text-yellow-500",
                    progress: 65,
                  },
                  {
                    label: "Promedio de Puntuación",
                    val: "85%",
                    icon: Target,
                    color: "text-green-500",
                    progress: 85,
                  },
                  {
                    label: "Tiempo Total",
                    val: "12h 30m",
                    icon: Clock,
                    color: "text-orange-500",
                    progress: 40,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <stat.icon size={16} className={stat.color} />
                        <span className="text-sm font-bold text-gray-500">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-xl font-black text-gray-800">
                        {stat.val}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-yellow-500 rounded-full transition-all duration-1000`}
                        style={{ width: `${stat.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Placeholder de Secciones Futuras */}
            <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-dashed border-gray-200 text-center py-10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Mas funciones próximamente...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
