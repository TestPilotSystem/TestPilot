"use client";

import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  confirmButtonClass?: string;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  loading = false,
  loadingText,
  icon,
  iconBgClass = "bg-red-500/10",
  iconTextClass = "text-red-400",
  confirmButtonClass = "bg-red-500 hover:bg-red-600",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1E293B] w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50 animate-in zoom-in duration-200">
        <div className="flex justify-center mb-6">
          <div className={`${iconBgClass} p-4 rounded-2xl ${iconTextClass}`}>
            {icon || <AlertTriangle size={32} />}
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-slate-50 mb-2">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white ${confirmButtonClass} transition-colors disabled:opacity-50`}
          >
            {loading ? (loadingText || "Procesando...") : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-700/50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
