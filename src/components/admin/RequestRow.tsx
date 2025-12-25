"use client";

import { Check, X, Mail } from "lucide-react";

interface RequestRowProps {
  request: any;
  onAction: (id: number, status: "APPROVED" | "REJECTED") => void;
}

const RequestRow = ({ request, onAction }: RequestRowProps) => {
  const { user } = request;

  return (
    <div className="flex items-center justify-between p-6 bg-[#fbfaf7] rounded-2xl border border-gray-50 hover:border-yellow-200 transition mb-4">
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
          <p className="font-bold text-gray-800">{user.firstName} {user.lastName}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contacto</p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Mail size={14} className="text-yellow-700" /> {user.email}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">DNI / Fecha</p>
          <p className="text-sm text-gray-600 font-mono">{user.dni}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onAction(request.id, "REJECTED")}
          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
          title="Rechazar"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => onAction(request.id, "APPROVED")}
          className="bg-yellow-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-yellow-800 transition shadow-md"
        >
          <Check size={18} /> Aprobar
        </button>
      </div>
    </div>
  );
};

export default RequestRow;