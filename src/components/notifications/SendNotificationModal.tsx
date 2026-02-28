"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: { id: number; name: string }[];
}

export default function SendNotificationModal({
  isOpen,
  onClose,
  recipients,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !messageBody.trim()) {
      toast.error("Rellena el título y el cuerpo del mensaje");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: recipients.map((r) => r.id),
          title: title.trim(),
          messageBody: messageBody.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setTitle("");
        setMessageBody("");
        onClose();
      } else {
        toast.error(data.message || "Error al enviar");
      }
    } catch (error) {
      toast.error("Error al enviar la notificación");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-surface rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Enviar notificación
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {recipients.length === 1
                    ? `Para: ${recipients[0].name}`
                    : `Para: ${recipients.length} alumnos`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Recordatorio de clase práctica"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-accent outline-none transition"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Mensaje
                </label>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Escribe el mensaje que quieres enviar..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-accent outline-none transition resize-none"
                  maxLength={2000}
                />
                <p className="text-[10px] text-slate-600 mt-1 text-right">
                  {messageBody.length}/2000
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
              <button
                onClick={onClose}
                disabled={sending}
                className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !title.trim() || !messageBody.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-accent text-white rounded-xl hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
