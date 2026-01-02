"use client";

import { useState } from "react";
import {
  Upload,
  AlertTriangle,
  FileText,
  Loader2,
  Info,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import Image from "next/image";

export default function UploadDocsPage() {
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !topic) {
      toast.error("Por favor, rellena el tema y selecciona un PDF");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("topic", topic);

    try {
      const res = await fetch("/api/admin/docs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast.success("Documento procesado e indexado correctamente");
      setFile(null);
      setTopic("");
    } catch (error) {
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    if (confirmText !== "CONFIRMAR") return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/docs", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Base de datos vectorial reseteada");
      setIsResetModalOpen(false);
      setConfirmText("");
    } catch (error) {
      toast.error("Error al resetear la base de datos");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <Toaster richColors />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          Admin: Gestión RAG
        </h1>
        <p className="text-gray-400 font-medium">
          Sube manuales oficiales para alimentar el motor de IA.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
        <div className="space-y-4">
          <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-2">
            Tema / Etiqueta del Manual
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej. Normativa de Velocidad"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition placeholder:text-gray-400 text-gray-800"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-2">
            Archivo PDF
          </label>
          <div
            className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center justify-center gap-4 ${
              file
                ? "border-green-200 bg-green-50/30"
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div
              className={`p-4 rounded-2xl ${
                file ? "bg-green-100 text-green-600" : "bg-white text-gray-400"
              } shadow-sm`}
            >
              {file ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">
                {file ? file.name : "Seleccionar PDF"}
              </p>
              <p className="text-xs text-gray-400 font-medium tracking-tight">
                El manual se troceará e indexará automáticamente
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 text-blue-700 text-xs font-medium border border-blue-100">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p>
            La etiqueta del tema ayuda al RAG a recuperar información más
            precisa cuando los usuarios realicen tests de temas específicos.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-[#d4af37] text-white p-5 rounded-2xl font-black text-lg hover:bg-[#b8962e] transition shadow-lg shadow-yellow-100 disabled:cursor-not-allowed cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
          {isUploading ? "Procesando..." : "Cargar en Base Vectorial"}
        </button>
      </div>

      <div className="pt-10 border-t border-gray-100 text-center space-y-6">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Zona de Peligro
        </p>
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-bold hover:bg-red-100 transition flex items-center gap-2 mx-auto disabled:cursor-not-allowed cursor-pointer"
        >
          <AlertTriangle size={18} /> Reiniciar Base de Datos Vectorial
        </button>
      </div>

      {/* Modal de Reseteo */}
      {isResetModalOpen && (
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
                ¿Borrar todos los datos?
              </h2>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Esta acción es irreversible. La IA perderá todo el conocimiento
                de los manuales subidos hasta ahora.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-center text-red-500 uppercase tracking-widest">
                Escribe CONFIRMAR para proceder
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CONFIRMAR"
                className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl outline-none text-center font-black text-red-600 placeholder:text-red-200 focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setConfirmText("");
                }}
                className="flex-1 p-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                disabled={confirmText !== "CONFIRMAR" || isResetting}
                onClick={handleReset}
                className="flex-1 bg-red-600 text-white p-4 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-30 disabled:grayscale transition flex items-center justify-center gap-2 shadow-lg shadow-red-100"
              >
                {isResetting && <Loader2 size={18} className="animate-spin" />}
                Confirmar Borrado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
