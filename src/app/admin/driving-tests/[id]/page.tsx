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

  const handleGenerateIA = async () => {
    setIsGeneratingIA(true);
    const toastId = toast.loading("La IA está redactando la pregunta...");

    try {
      const aiRes = await fetch(
        `/api/admin/questions/generate?topic=${encodeURIComponent(test.topic.name)}`
      );

      if (!aiRes.ok) throw new Error("Fallo en la generación de la IA");
      const aiData = await aiRes.json();

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
      <div className="p-20 text-center font-bold text-slate-500">
        Cargando test...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12 pb-32">
      <Toaster richColors />

      <div className="flex justify-between items-center bg-surface p-8 rounded-[2.5rem] border border-slate-700/50">
        <div className="space-y-3">
          <Link
            href="/admin/inicio"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-accent uppercase tracking-widest transition"
          >
            <ChevronLeft size={14} /> Volver al panel
          </Link>
          <h1 className="text-3xl font-black text-slate-50">
            {test.topic.name}
          </h1>
          <div className="flex gap-4 text-sm text-slate-500 font-bold">
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
          className="flex items-center gap-2 bg-red-500/10 text-red-400 px-6 py-3 rounded-2xl font-bold hover:bg-red-500/20 transition"
        >
          <Trash2 size={18} /> Eliminar Test
        </button>
      </div>

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

      <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-[2.5rem] p-12 flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            ¿Faltan preguntas en este test?
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Añade contenido extra para completar el examen. Puedes redactarla tú
            mismo o pedirle ayuda a la inteligencia artificial.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-3 bg-surface text-slate-200 border border-slate-700/50 px-8 py-4 rounded-2xl font-bold hover:bg-slate-700 transition"
          >
            <Plus size={20} className="text-accent" /> Crear pregunta manual
          </button>

          <button
            onClick={handleGenerateIA}
            disabled={isGeneratingIA}
            className="flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent-light transition shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingIA ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Sparkles size={20} />
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
