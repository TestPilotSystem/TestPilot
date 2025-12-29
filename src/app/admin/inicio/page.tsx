"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Settings,
} from "lucide-react";

export default function AdminHomePage() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch("/api/admin/driving-tests")
      .then((res) => res.json())
      .then((data) => setTests(data.slice(0, 4)));
  }, []);

  return (
    <div className="p-8 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">
            Gestiona los tests, solicitudes y configuración de IA.
          </p>
        </div>
        <Link
          href="/admin/driving-tests/generate"
          className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8962e] text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-yellow-100"
        >
          <Plus size={20} /> Nuevo Test
        </Link>
      </header>

      {/* Sección Active Driving Tests */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="text-[#d4af37]" />
            <h2 className="text-xl font-bold text-gray-700">Tests Activos</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tests.map((test: any) => (
            <div
              key={test.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group relative"
            >
              <span className="absolute top-4 right-4 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">
                Activo
              </span>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-50 transition">
                <FileText className="text-gray-400 group-hover:text-[#d4af37]" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">
                {test.topic.name}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Actualizado: {new Date(test.createdAt).toLocaleDateString()}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">
                  {test._count.questions} Qs
                </span>
                <Link
                  href={`/admin/driving-tests/${test.id}`}
                  className="text-xs font-bold text-[#d4af37] hover:underline"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Placeholders para las otras secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-300">
          <Users size={48} className="mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">
            Gestión de Usuarios
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-300">
          <Settings size={48} className="mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">
            Ajustes de IA
          </p>
        </div>
      </div>
    </div>
  );
}
