"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  loading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  loading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-2xl text-red-500">
            <AlertTriangle size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Eliminando..." : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
