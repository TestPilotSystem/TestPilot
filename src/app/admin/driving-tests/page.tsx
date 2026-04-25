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
import { toast } from "sonner";
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
    (test.topic?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight">
            Driving Tests
          </h1>
          <p className="text-slate-400 text-sm">
            Administración central de exámenes generados por IA.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Filtrar por tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all text-slate-200 placeholder:text-slate-500"
            />
          </div>
          <Link
            href="/admin/driving-tests/generate"
            className="bg-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-light transition shadow-lg shadow-accent/20"
          >
            <Plus size={20} /> Generar Nuevo
          </Link>
        </div>
      </div>

      <div className="bg-surface rounded-[2.5rem] border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Nombre del Test
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Preguntas
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Fecha
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-slate-500 animate-pulse"
                  >
                    Cargando repositorio...
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-slate-500 italic"
                  >
                    No hay tests que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test: any) => (
                  <tr
                    key={test.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100">
                            {test.topic?.name ?? <span className="text-slate-500 italic text-xs">Sin tema</span>}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            ID: {test.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                        <Layers size={16} className="text-accent" />
                        {test._count.questions} items
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar size={16} />
                        {new Date(test.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/driving-tests/${test.id}`}
                          className="p-2.5 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                        >
                          <Eye size={20} />
                        </Link>
                        <button
                          onClick={() => setTestToDelete(test.id)}
                          className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
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
