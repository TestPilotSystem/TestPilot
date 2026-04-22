"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title:        string;
  description:  string;
  confirmText:  string;
  loading?:     boolean;
  loadingText?: string;
  icon?:              ReactNode;
  iconBgClass?:       string;
  iconTextClass?:     string;
  confirmButtonClass?: string;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  loading       = false,
  loadingText,
  icon,
  iconBgClass        = "bg-error/10",
  iconTextClass      = "text-error-light",
  confirmButtonClass = "bg-error hover:bg-error-light active:bg-error/80",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="w-full max-w-sm bg-surface-raised rounded-2xl border border-border-strong shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Top accent strip — inferred from iconBgClass */}
        <div className={`h-0.5 w-full ${iconBgClass.replace("/10", "").replace("bg-", "bg-")} opacity-60`} />

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`${iconBgClass} ${iconTextClass} p-4 rounded-xl border border-current/10`}>
              {icon ?? <AlertTriangle size={28} />}
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8 space-y-2">
            <h3 className="text-lg font-bold text-fg-primary">{title}</h3>
            <p className="text-sm text-fg-muted leading-relaxed">{description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={[
                "w-full h-11 flex items-center justify-center gap-2",
                "rounded-xl font-bold text-sm text-white",
                "transition-all duration-[120ms] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                confirmButtonClass,
              ].join(" ")}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? (loadingText ?? "Procesando...") : confirmText}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-sm text-fg-muted hover:text-fg-primary hover:bg-surface-overlay transition-all duration-[120ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
