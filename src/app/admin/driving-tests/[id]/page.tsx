"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Trash2,
  CheckCircle2,
  Info,
  Calendar,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function TestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const res = await fetch(`/api/admin/driving-tests/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el test");
        const data = await res.json();
        setTest(data);
      } catch (error) {
        toast.error("Error al obtener los detalles");
      } finally {
        setLoading(false);
      }
    };
    fetchTestDetails();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/driving-tests/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el test");

      toast.success("Test eliminado correctamente");
      setIsDeleteModalOpen(false);
      router.push("/admin/inicio");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-medium">Cargando test</p>
      </div>
    );
  }

  if (!test)
    return (
      <div className="p-8 text-center text-gray-500">Test no encontrado.</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <Toaster richColors position="top-right" />

      {/* Navegación y Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-3">
          <Link
            href="/admin/inicio"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-yellow-600 transition uppercase tracking-widest"
          >
            <ChevronLeft size={14} /> Volver al panel
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {test.topic.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />{" "}
                {new Date(test.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash size={14} /> {test.questions.length} Preguntas
              </span>
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold self-center">
                ACTIVO
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100 shadow-sm active:scale-95"
        >
          <Trash2 size={18} /> Eliminar
        </button>
      </div>

      {/* Listado de Preguntas */}
      <div className="grid grid-cols-1 gap-8">
        {test.questions.map((q: any, index: number) => (
          <div
            key={q.id}
            className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:border-yellow-100 transition-colors space-y-8"
          >
            <div className="flex items-start gap-5">
              <span className="bg-yellow-50 text-yellow-600 text-sm font-black w-10 h-10 flex items-center justify-center rounded-2xl shrink-0 shadow-sm">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold text-gray-800 leading-snug">
                {q.enunciado}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {q.opciones.map((opcion: string) => {
                const isCorrect = opcion === q.respuestaCorrecta;
                return (
                  <div
                    key={opcion}
                    className={`flex items-center justify-between p-6 rounded-[1.5rem] border-2 transition-all ${
                      isCorrect
                        ? "bg-green-50 border-green-200 text-green-800 font-bold"
                        : "bg-gray-50/30 border-gray-50 text-gray-400"
                    }`}
                  >
                    <span className="text-base">{opcion}</span>
                    {isCorrect && (
                      <CheckCircle2 size={24} className="text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {q.explicacion && (
              <div className="bg-[#fbfaf7] p-6 rounded-[1.5rem] flex gap-5 border border-gray-100">
                <div className="p-3 bg-white rounded-2xl shadow-sm h-fit text-yellow-500">
                  <Info size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Explicación de la IA
                  </p>
                  <p className="text-gray-600 leading-relaxed italic text-[15px]">
                    {q.explicacion}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar este Test?"
        description="Esta acción borrará permanentemente el test y todas sus preguntas. Esta operación no se puede deshacer."
        confirmText="Confirmar eliminación"
        loading={isDeleting}
      />
    </div>
  );
}
