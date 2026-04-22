"use client";

import { Check, X, Mail } from "lucide-react";

interface RequestRowProps {
  request:  any;
  onAction: (id: number, status: "APPROVED" | "REJECTED") => void;
}

const RequestRow = ({ request, onAction }: RequestRowProps) => {
  const { user } = request;

  return (
    <div className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-border hover:border-border-strong transition-all duration-[120ms] group">
      <div className="flex-1 grid grid-cols-3 gap-6">
        <div>
          <p className="text-[10px] font-black text-fg-muted uppercase tracking-widest mb-1">
            Nombre
          </p>
          <p className="font-bold text-fg-primary text-sm">
            {user.firstName} {user.lastName}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black text-fg-muted uppercase tracking-widest mb-1">
            Contacto
          </p>
          <p className="text-sm text-fg-secondary flex items-center gap-1.5">
            <Mail size={13} className="text-accent shrink-0" />
            {user.email}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black text-fg-muted uppercase tracking-widest mb-1">
            DNI
          </p>
          <p className="text-sm text-fg-secondary font-mono">{user.dni}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-6">
        {/* Reject */}
        <button
          onClick={() => onAction(request.id, "REJECTED")}
          className="p-2.5 text-fg-muted hover:text-error-light hover:bg-error/10 rounded-lg border border-transparent hover:border-error/20 transition-all duration-[120ms] active:scale-95"
          title="Rechazar"
        >
          <X size={18} />
        </button>

        {/* Approve */}
        <button
          onClick={() => onAction(request.id, "APPROVED")}
          className="flex items-center gap-2 h-9 px-5 bg-accent hover:bg-accent-light active:bg-accent-dark text-white text-sm font-bold rounded-full shadow-sm hover:shadow-accent transition-all duration-[120ms] active:scale-[0.97]"
        >
          <Check size={15} />
          Aprobar
        </button>
      </div>
    </div>
  );
};

export default RequestRow;
