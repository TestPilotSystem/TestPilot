"use client";

import { useEffect, useState } from "react";
import { Search, MessageSquare, UserMinus, Loader2 } from "lucide-react";
import { PendingAlert } from "@/components/admin/user-management/PendingAlert";
import { toast, Toaster } from "sonner";

export default function AdminUsersPage() {
  const [students, setStudents] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      const count = data.filter((r: any) => r.status === "PENDING").length;
      setPendingCount(count);
    } catch (error) {
      console.error("Error al actualizar pendientes", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, requestsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/requests"),
        ]);

        const usersData = await usersRes.json();
        const requestsData = await requestsRes.json();

        setStudents(usersData);
        setPendingCount(
          requestsData.filter((r: any) => r.status === "PENDING").length
        );
      } catch (error) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Polling every 30 seconds to update pending requests count
    const interval = setInterval(fetchPendingCount, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar a este alumno del curso?"))
      return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setStudents(students.filter((s: any) => s.id !== id));
      toast.success("Alumno eliminado correctamente");
    } catch (error) {
      toast.error("No se pudo eliminar al usuario");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-yellow-500" size={40} />
        <p className="text-gray-400 font-bold">Cargando alumnos...</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <Toaster richColors />

      {pendingCount > 0 && <PendingAlert count={pendingCount} />}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">
            Alumnos
          </h1>
          <p className="text-gray-400 font-medium">
            Gestiona los alumnos matriculados en el curso
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar alumno..."
            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Alumno
              </th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                DNI
              </th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student: any) => (
              <tr key={student.id} className="hover:bg-gray-50/30 transition">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 uppercase">
                      {student.firstName.charAt(0)}
                      {student.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-sm text-gray-500 font-medium">
                  {student.dni || "No aportado"}
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition"
                      onClick={() =>
                        toast.info(
                          "El módulo de notificaciones estará listo pronto"
                        )
                      }
                    >
                      <MessageSquare size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(student.id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <UserMinus size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
