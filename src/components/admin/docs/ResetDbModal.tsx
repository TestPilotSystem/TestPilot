"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetDbModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (confirmText !== "CONFIRMAR") return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/docs", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Base de datos vectorial reseteada");
      setConfirmText("");
      onClose();
    } catch (error) {
      toast.error("Error al resetear la base de datos");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-center">
          <Image
            src="/warning.png"
            alt="Peligro"
            width={100}
            height={100}
            className="drop-shadow-xl"
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-800">
            ¿Estás absolutamente seguro?
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            Esta acción eliminará todos los documentos indexados. La IA dejará
            de tener contexto para generar preguntas.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-center text-red-500 uppercase tracking-widest">
            Escribe CONFIRMAR para continuar
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="CONFIRMAR"
            className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl outline-none text-center font-black text-red-600 placeholder:text-red-200 focus:ring-2 focus:ring-red-500 transition"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setConfirmText("");
              onClose();
            }}
            className="flex-1 p-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            disabled={confirmText !== "CONFIRMAR" || isResetting}
            onClick={handleReset}
            className="flex-1 bg-red-600 text-white p-4 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResetting && <Loader2 size={18} className="animate-spin" />}
            Borrar Todo
          </button>
        </div>
      </div>
    </div>
  );
}
