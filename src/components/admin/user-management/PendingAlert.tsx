import { UserPlus } from "lucide-react";
import Link from "next/link";

export function PendingAlert({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm">
          <UserPlus size={24} />
        </div>
        <div>
          <h3 className="font-black text-amber-900 uppercase tracking-tight text-sm">
            Solicitudes Pendientes
          </h3>
          <p className="text-amber-700 text-xs">
            Tienes {count} alumnos esperando para unirse a la plataforma.
          </p>
        </div>
      </div>
      <Link
        href="/admin/requests"
        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-amber-700 transition"
      >
        Gestionar ahora
      </Link>
    </div>
  );
}
