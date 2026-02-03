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
  Check,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function AdminHomePage() {
  const [allTests, setAllTests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);

  const itemsPerPage = 4;

  useEffect(() => {
    fetch("/api/admin/driving-tests")
      .then((res) => res.json())
      .then((data) => setAllTests(data));

    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      setPendingRequests(data.filter((r: any) => r.status === "PENDING"));
    } catch (error) {
      console.error("Error al cargar solicitudes", error);
    }
  };

  const handleRequestAction = async (requestId: number, status: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        `Solicitud ${status === "APPROVED" ? "aceptada" : "rechazada"}`
      );
      fetchRequests();
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    }
  };

  const nextSlide = () => {
    if (currentIndex + itemsPerPage < allTests.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="p-8 space-y-10">
      <Toaster richColors />
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">
            Gestiona los tests, solicitudes y configuración de IA.
          </p>
        </div>
        <Link
          href="/admin/driving-tests/generate"
          className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8962e] text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-yellow-100 cursor-pointer"
        >
          <Plus size={20} /> Nuevo Test
        </Link>
      </header>

      {/* Sección Active Driving Tests */}
      <section className="space-y-6 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="text-[#d4af37]" />
            <h2 className="text-xl font-bold text-gray-700">Tests Activos</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 border border-gray-300 rounded-xl hover:bg-yellow-50 hover:border-yellow-200 text-gray-600 hover:text-yellow-700 transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex + itemsPerPage >= allTests.length}
              className="p-2 border border-gray-300 rounded-xl hover:bg-yellow-50 hover:border-yellow-200 text-gray-600 hover:text-yellow-700 transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Contenedor del carrusel */}
        <div className="relative">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            }}
          >
            {allTests.map((test: any) => (
              <div
                key={test.id}
                className="min-w-[calc(25%-18px)] bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group relative"
              >
                <span className="absolute top-4 right-4 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  Activo
                </span>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-50 transition">
                  <FileText className="text-gray-400 group-hover:text-[#d4af37]" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1 truncate">
                  {test.topic?.name || test.name || "Test Personalizado"}
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
                    className="text-xs font-bold text-[#d4af37] hover:underline cursor-pointer"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gestión de Usuarios Rápida */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                User Management
              </h2>
            </div>
            {pendingRequests.length > 0 && (
              <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold">
                {pendingRequests.length} PENDING
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 py-10">
                <Users size={40} className="opacity-20" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  No hay solicitudes
                </p>
              </div>
            ) : (
              pendingRequests.slice(0, 3).map((req: any) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {req.user.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {req.user.firstName} {req.user.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        DNI: {req.user.dni || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestAction(req.id, "APPROVED")}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition cursor-pointer"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleRequestAction(req.id, "REJECTED")}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href="/admin/users"
            className="block text-center w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition border-t border-gray-100 mt-4 cursor-pointer"
          >
            Ver todos los usuarios
          </Link>
        </div>

        {/* Ajustes de IA */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-300 relative overflow-hidden">
          <div className="absolute top-6 left-8 flex items-center gap-3">
            <div className="p-2 bg-gray-50 text-gray-400 rounded-xl">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              AI Assistant Settings
            </h2>
          </div>
          <Settings size={48} className="mb-4 opacity-60" />
          <p className="font-bold uppercase tracking-widest text-xs">
            Próximamente: Configuración avanzada
          </p>
        </div>
      </div>
    </div>
  );
}
