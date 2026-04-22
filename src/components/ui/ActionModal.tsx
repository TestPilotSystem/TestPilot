"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ActionModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  onConfirm:   (notes: string) => void;
  title:       string;
  confirmText: string;
  variant:     "APPROVED" | "REJECTED";
}

const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  variant,
}: ActionModalProps) => {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const isApprove = variant === "APPROVED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-surface-raised rounded-2xl border border-border-strong shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Top strip */}
        <div className={`h-0.5 w-full ${isApprove ? "bg-accent/60" : "bg-error/60"}`} />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-fg-primary">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-fg-muted hover:text-fg-primary hover:bg-surface-overlay rounded-lg transition-all duration-[120ms] active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Notes textarea */}
          <div className="mb-6 flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-fg-muted uppercase tracking-widest">
              Notas del administrador (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-surface border border-border-strong rounded-xl px-4 py-3 text-sm text-fg-primary placeholder:text-fg-muted outline-none resize-none transition-all duration-[120ms] focus:ring-2 focus:ring-brand/40 focus:border-transparent"
              placeholder="Escribe aquí el motivo o anotaciones..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl font-semibold text-sm text-fg-muted hover:text-fg-primary hover:bg-surface-overlay transition-all duration-[120ms] active:scale-[0.98]"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm(notes);
                setNotes("");
              }}
              className={[
                "flex-1 h-11 rounded-xl font-bold text-sm text-white",
                "transition-all duration-[120ms] active:scale-[0.98]",
                isApprove
                  ? "bg-accent hover:bg-accent-light active:bg-accent-dark shadow-sm hover:shadow-accent"
                  : "bg-error hover:bg-error-light active:bg-error/80 shadow-sm",
              ].join(" ")}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
