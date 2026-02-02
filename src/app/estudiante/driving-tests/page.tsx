"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Filter, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StudentTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/driving-tests")
      .then((res) => res.json())
      .then((data) => {
        setTests(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#fafafa]">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#fafafa]">
      <main className="p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Tests Disponibles 🚗
          </h1>
          <p className="text-gray-500 font-medium">
            Selecciona una categoría y demuestra lo que sabes.
          </p>
        </header>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por tema..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition shadow-sm font-medium"
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-yellow-600 transition shadow-sm cursor-pointer">
            <Filter size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tests.map((test: any) => (
            <div
              key={test.id}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300">
                  <BookOpen size={28} />
                </div>
                <span className="bg-gray-50 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">
                  {test._count.questions} Preguntas
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                {test.topic.name}
              </h3>
              <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2">
                Domina este bloque de contenido practicando con preguntas reales
                de examen.
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
                  <Clock size={14} className="text-yellow-500" />
                  30 min
                </div>
                <Link
                  href={`/estudiante/driving-tests/${test.id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-yellow-100 cursor-pointer active:scale-95"
                >
                  Empezar Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
