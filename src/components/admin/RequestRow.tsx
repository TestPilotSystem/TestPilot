"use client";

import { Check, X, Mail } from "lucide-react";

interface RequestRowProps {
  request: any;
  onAction: (id: number, status: "APPROVED" | "REJECTED") => void;
}

const RequestRow = ({ request, onAction }: RequestRowProps) => {
  const { user } = request;

  return (
    <div className="flex items-center justify-between p-6 bg-surface rounded-2xl border border-slate-700/50 hover:border-slate-600 transition mb-4">
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</p>
          <p className="font-bold text-slate-100">{user.firstName} {user.lastName}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contacto</p>
          <p className="text-sm text-slate-300 flex items-center gap-2">
            <Mail size={14} className="text-accent" /> {user.email}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DNI / Fecha</p>
          <p className="text-sm text-slate-300 font-mono">{user.dni}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onAction(request.id, "REJECTED")}
          className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
          title="Rechazar"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => onAction(request.id, "APPROVED")}
          className="bg-accent text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-accent-light transition shadow-md shadow-accent/20"
        >
          <Check size={18} /> Aprobar
        </button>
      </div>
    </div>
  );
};

export default RequestRow;