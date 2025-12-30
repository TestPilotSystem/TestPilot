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
      className={`bg-white rounded-[2.5rem] p-10 border shadow-sm transition-all space-y-8 ${
        isEditing
          ? "border-yellow-400 ring-4 ring-yellow-50"
          : "border-gray-100 hover:border-yellow-100"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-5 flex-1">
          <span className="bg-yellow-50 text-yellow-600 text-sm font-black w-10 h-10 flex items-center justify-center rounded-2xl shrink-0 shadow-sm">
            {index + 1}
          </span>
          {isEditing ? (
            <textarea
              className="w-full text-xl font-bold text-gray-800 leading-snug bg-gray-50 p-4 rounded-xl border-none focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
              value={editForm.enunciado}
              onChange={(e) =>
                setEditForm({ ...editForm, enunciado: e.target.value })
              }
              rows={2}
            />
          ) : (
            <h3 className="text-xl font-bold text-gray-800 leading-snug">
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
                className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => onDelete(q.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
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
                    ? "bg-green-50 border-green-200 text-green-800 font-bold"
                    : "bg-gray-50/30 border-gray-50 text-gray-400"
                }`}
              >
                {isEditing ? (
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full font-bold text-green-800 p-0"
                    value={opcion}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                ) : (
                  <span className="text-base">{opcion}</span>
                )}
                {isCorrect && (
                  <CheckCircle2 size={24} className="text-green-500" />
                )}
              </div>
            );
          }
        )}
      </div>

      {(isEditing || q.explicacion) && (
        <div className="bg-[#fbfaf7] p-6 rounded-[1.5rem] flex gap-5 border border-gray-100">
          <div className="p-3 bg-white rounded-2xl shadow-sm h-fit text-yellow-500">
            <Info size={22} />
          </div>
          <div className="space-y-1 w-full">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Explicación
            </p>
            {isEditing ? (
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-gray-600 leading-relaxed italic text-[15px] p-0 outline-none resize-none"
                value={editForm.explicacion || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, explicacion: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="text-gray-600 leading-relaxed italic text-[15px]">
                {q.explicacion}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
