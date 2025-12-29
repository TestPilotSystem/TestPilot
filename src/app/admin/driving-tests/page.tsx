"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Layers,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminDrivingTestsPage() {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch("/api/admin/driving-tests");
      const data = await res.json();
      setTests(data);
    } catch (error) {
      toast.error("Error al cargar los tests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/driving-tests/${testToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar");

      toast.success("Test eliminado definitivamente");
      setTests(tests.filter((t: any) => t.id !== testToDelete));
    } catch (error) {
      toast.error("Error al eliminar el test");
    } finally {
      setIsDeleting(false);
      setTestToDelete(null);
    }
  };

  const filteredTests = tests.filter((test: any) =>
    test.topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <Toaster richColors />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Driving Tests
          </h1>
          <p className="text-gray-500 text-sm">
            Administración central de exámenes generados por IA.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Filtrar por tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
            />
          </div>
          <Link
            href="/admin/driving-tests/generate"
            className="bg-[#d4af37] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#b8962e] transition shadow-lg shadow-yellow-100"
          >
            <Plus size={20} /> Generar Nuevo
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Nombre del Test
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Preguntas
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Fecha
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-gray-400 animate-pulse"
                  >
                    Cargando repositorio...
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-gray-400 italic"
                  >
                    No hay tests que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test: any) => (
                  <tr
                    key={test.id}
                    className="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">
                            {test.topic.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono uppercase">
                            ID: {test.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                        <Layers size={16} className="text-[#d4af37]" />
                        {test._count.questions} items
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={16} />
                        {new Date(test.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/driving-tests/${test.id}`}
                          className="p-2.5 text-gray-400 hover:text-[#d4af37] hover:bg-yellow-50 rounded-xl transition-all"
                        >
                          <Eye size={20} />
                        </Link>
                        <button
                          onClick={() => setTestToDelete(test.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!testToDelete}
        onClose={() => setTestToDelete(null)}
        onConfirm={handleDelete}
        title="¿Confirmar borrado?"
        description="Esta acción eliminará el test permanentemente. Se perderán todos los registros asociados."
        confirmText="Eliminar permanentemente"
        loading={isDeleting}
      />
    </div>
  );
}
