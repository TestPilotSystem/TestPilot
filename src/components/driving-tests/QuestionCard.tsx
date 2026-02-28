"use client";

import { useState } from "react";
import { Pencil, Save, X, Trash2, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

export default function QuestionCard({ q, index, onUpdate, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...q });

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      onUpdate(editForm);
      setIsEditing(false);
      toast.success("Pregunta actualizada");
    } catch (error) {
      toast.error("Error al guardar los cambios");
    }
  };

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...editForm.opciones];
    newOptions[idx] = value;
    setEditForm({ ...editForm, opciones: newOptions });
  };

  return (
    <div
      className={`bg-surface rounded-[2.5rem] p-10 border shadow-sm transition-all space-y-8 ${
        isEditing
          ? "border-accent ring-4 ring-accent/10"
          : "border-slate-700/50 hover:border-slate-600"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-5 flex-1">
          <span className="bg-accent/10 text-accent text-sm font-black w-10 h-10 flex items-center justify-center rounded-2xl shrink-0">
            {index + 1}
          </span>
          {isEditing ? (
            <textarea
              className="w-full text-xl font-bold text-slate-100 leading-snug bg-slate-800 p-4 rounded-xl border-none focus:ring-2 focus:ring-accent outline-none resize-none"
              value={editForm.enunciado}
              onChange={(e) =>
                setEditForm({ ...editForm, enunciado: e.target.value })
              }
              rows={2}
            />
          ) : (
            <h3 className="text-xl font-bold text-slate-100 leading-snug">
              {q.enunciado}
            </h3>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                <Save size={20} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-xl transition"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => onDelete(q.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(isEditing ? editForm.opciones : q.opciones).map(
          (opcion: string, idx: number) => {
            const isCorrect = isEditing
              ? opcion === editForm.respuestaCorrecta
              : opcion === q.respuestaCorrecta;
            return (
              <div
                key={idx}
                onClick={() =>
                  isEditing &&
                  setEditForm({ ...editForm, respuestaCorrecta: opcion })
                }
                className={`flex items-center justify-between p-6 rounded-[1.5rem] border-2 transition-all ${
                  isEditing ? "cursor-pointer" : ""
                } ${
                  isCorrect
                    ? "bg-green-500/10 border-green-500/30 text-green-400 font-bold"
                    : "bg-slate-800/30 border-slate-700/30 text-slate-400"
                }`}
              >
                {isEditing ? (
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full font-bold text-green-400 p-0"
                    value={opcion}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                ) : (
                  <span className="text-base">{opcion}</span>
                )}
                {isCorrect && (
                  <CheckCircle2 size={24} className="text-green-400" />
                )}
              </div>
            );
          }
        )}
      </div>

      {(isEditing || q.explicacion) && (
        <div className="bg-slate-800/50 p-6 rounded-[1.5rem] flex gap-5 border border-slate-700/50">
          <div className="p-3 bg-slate-700 rounded-2xl h-fit text-accent">
            <Info size={22} />
          </div>
          <div className="space-y-1 w-full">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Explicación
            </p>
            {isEditing ? (
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-slate-300 leading-relaxed italic text-[15px] p-0 outline-none resize-none"
                value={editForm.explicacion || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, explicacion: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="text-slate-300 leading-relaxed italic text-[15px]">
                {q.explicacion}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
