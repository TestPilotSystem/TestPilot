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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Notas del administrador (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-4 bg-[#fbfaf7] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none resize-none text-gray-700"
            placeholder="Escribe aquí el motivo o anotaciones..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(notes);
              setNotes("");
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition ${
              variant === "APPROVED" ? "bg-yellow-700 hover:bg-yellow-800" : "bg-red-500 hover:bg-red-600"
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