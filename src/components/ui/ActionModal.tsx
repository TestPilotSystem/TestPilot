"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  title: string;
  confirmText: string;
  variant: "APPROVED" | "REJECTED";
}

const ActionModal = ({ isOpen, onClose, onConfirm, title, confirmText, variant }: ActionModalProps) => {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E293B] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-700/50 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-50">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Notas del administrador (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-4 bg-slate-800 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-accent outline-none resize-none text-slate-200 placeholder:text-slate-500"
            placeholder="Escribe aquí el motivo o anotaciones..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-700/50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(notes);
              setNotes("");
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition ${
              variant === "APPROVED" ? "bg-accent hover:bg-accent-light" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;