import { UserPlus } from "lucide-react";
import Link from "next/link";

export function PendingAlert({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="bg-highlight/10 border border-highlight/20 p-6 rounded-[2rem] flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-2xl text-highlight shadow-sm">
          <UserPlus size={24} />
        </div>
        <div>
          <h3 className="font-black text-highlight uppercase tracking-tight text-sm">
            Solicitudes Pendientes
          </h3>
          <p className="text-highlight/70 text-xs">
            Tienes {count} alumnos esperando para unirse a la plataforma.
          </p>
        </div>
      </div>
      <Link
        href="/admin/requests"
        className="bg-highlight text-slate-900 px-6 py-3 rounded-xl font-bold text-xs hover:bg-highlight/80 transition"
      >
        Gestionar ahora
      </Link>
    </div>
  );
}
