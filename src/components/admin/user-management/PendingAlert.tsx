import { UserPlus } from "lucide-react";
import Link from "next/link";

export function PendingAlert({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between p-5 bg-warning/8 border border-warning/20 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-warning/10 rounded-xl text-warning border border-warning/20 shrink-0">
          <UserPlus size={22} />
        </div>
        <div>
          <h3 className="font-black text-warning text-sm uppercase tracking-tight leading-none">
            Solicitudes Pendientes
          </h3>
          <p className="text-warning/70 text-xs mt-1 font-medium">
            {count} {count === 1 ? "alumno" : "alumnos"} esperando para unirse a la plataforma.
          </p>
        </div>
      </div>

      <Link
        href="/admin/requests"
        className="h-9 px-5 flex items-center text-xs font-bold text-background bg-warning hover:bg-warning-light rounded-full transition-all duration-[120ms] active:scale-[0.97] shrink-0"
      >
        Gestionar ahora
      </Link>
    </div>
  );
}
