"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Trash2,
  Calendar,
  Hash,
  Sparkles,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import QuestionCard from "@/components/driving-tests/QuestionCard";
import NewQuestionModal from "@/components/driving-tests/NewQuestionModal";

export default function TestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // State for AI question generation
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/driving-tests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTest(data);
        setLoading(false);
      });
  }, [id]);

  const handleDeleteTest = async () => {
    setIsDeleting(true);
    await fetch(`/api/admin/driving-tests/${id}`, { method: "DELETE" });
    router.push("/admin/inicio");
  };

  const updateQuestionState = (updatedQ: any) => {
    setTest({
      ...test,
      questions: test.questions.map((q: any) =>
        q.id === updatedQ.id ? updatedQ : q
      ),
    });
  };

  const deleteQuestionState = async (qId: string) => {
    await fetch(`/api/admin/questions/${qId}`, { method: "DELETE" });
    setTest({
      ...test,
      questions: test.questions.filter((q: any) => q.id !== qId),
    });
    toast.success("Pregunta eliminada");
  };

  const handleSaveManual = async (formData: any) => {
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, testId: id }),
      });

      if (!res.ok) throw new Error();

      const newQ = await res.json();
      setTest({ ...test, questions: [...test.questions, newQ] });
      setIsManualModalOpen(false);
      toast.success("Pregunta añadida manualmente");
    } catch (error) {
      toast.error("Error al añadir la pregunta");
    }
  };

  // Logic for AI question generation
  const handleGenerateIA = async () => {
    setIsGeneratingIA(true);
    const toastId = toast.loading("La IA está redactando la pregunta...");

    try {
      // Generate question service integration
      const aiRes = await fetch(
        `http://127.0.0.1:8000/admin/ai/generate-question?topic=${encodeURIComponent(
          test.topic.name
        )}`
      );

      if (!aiRes.ok) throw new Error("Fallo en la generación de la IA");
      const aiData = await aiRes.json();

      // save to DB
      const saveRes = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: id,
          enunciado: aiData.pregunta,
          opciones: aiData.opciones,
          respuestaCorrecta: aiData.respuesta_correcta,
          explicacion: aiData.explicacion,
        }),
      });

      if (!saveRes.ok) throw new Error("Error al guardar en BD");

      const newQuestion = await saveRes.json();

      // Update state
      setTest({ ...test, questions: [...test.questions, newQuestion] });
      toast.success("Pregunta generada y guardada con éxito", { id: toastId });
    } catch (error) {
      toast.error("Error al generar con IA. Revisa el servidor local.", {
        id: toastId,
      });
    } finally {
      setIsGeneratingIA(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-gray-400">
        Cargando test...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12 pb-32">
      <Toaster richColors />

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-3">
          <Link
            href="/admin/inicio"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-yellow-600 uppercase tracking-widest transition"
          >
            <ChevronLeft size={14} /> Volver al panel
          </Link>
          <h1 className="text-3xl font-black text-gray-800">
            {test.topic.name}
          </h1>
          <div className="flex gap-4 text-sm text-gray-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />{" "}
              {new Date(test.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Hash size={14} /> {test.questions.length} Qs
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition"
        >
          <Trash2 size={18} /> Eliminar Test
        </button>
      </div>

      {/* Listado de Preguntas */}
      <div className="grid grid-cols-1 gap-8">
        {test.questions.map((q: any, index: number) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={index}
            onUpdate={updateQuestionState}
            onDelete={deleteQuestionState}
          />
        ))}
      </div>

      {/* Sección Añadir Pregunta */}
      <div className="bg-[#fbfaf7] border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            ¿Faltan preguntas en este test?
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Añade contenido extra para completar el examen. Puedes redactarla tú
            mismo o pedirle ayuda a la inteligencia artificial.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-3 bg-white text-gray-800 border border-gray-100 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm"
          >
            <Plus size={20} className="text-[#d4af37]" /> Crear pregunta manual
          </button>

          <button
            onClick={handleGenerateIA}
            disabled={isGeneratingIA}
            className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingIA ? (
              <Loader2 size={20} className="animate-spin text-yellow-400" />
            ) : (
              <Sparkles size={20} className="text-yellow-400" />
            )}
            {isGeneratingIA ? "Generando..." : "Generar con IA"}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTest}
        title="¿Eliminar Test?"
        description="Se borrará el test y todas sus preguntas para siempre."
        confirmText="Eliminar"
        loading={isDeleting}
      />

      <NewQuestionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleSaveManual}
        testId={id}
      />
    </div>
  );
}
