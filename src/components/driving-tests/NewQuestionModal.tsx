"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

export default function NewQuestionModal({
  isOpen,
  onClose,
  onSave,
  testId,
}: any) {
  const [form, setForm] = useState({
    enunciado: "",
    opciones: ["", "", ""],
    respuestaCorrecta: "",
    explicacion: "",
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.enunciado || !form.respuestaCorrecta) return;
    onSave(form);
    setForm({
      enunciado: "",
      opciones: ["", "", ""],
      respuestaCorrecta: "",
      explicacion: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E293B] rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl space-y-8 border border-slate-700/50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-50">
            Nueva Pregunta Manual
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400"
          >
            <X />
          </button>
        </div>

        <div className="space-y-6">
          <textarea
            placeholder="Enunciado de la pregunta"
            className="w-full p-4 bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-accent outline-none text-slate-200 placeholder:text-slate-500"
            value={form.enunciado}
            onChange={(e) => setForm({ ...form, enunciado: e.target.value })}
          />

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Opciones (Haz click para marcar la correcta)
            </p>
            {form.opciones.map((op, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input
                  className={`flex-1 p-4 rounded-xl border-2 transition text-slate-200 placeholder:text-slate-500 ${
                    form.respuestaCorrecta === op && op !== ""
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-slate-600 bg-slate-800"
                  }`}
                  value={op}
                  placeholder={`Opción ${idx + 1}`}
                  onChange={(e) => {
                    const newOps = [...form.opciones];
                    newOps[idx] = e.target.value;
                    setForm({ ...form, opciones: newOps });
                  }}
                />
                <button
                  onClick={() => setForm({ ...form, respuestaCorrecta: op })}
                  className={`p-4 rounded-xl font-bold transition ${
                    form.respuestaCorrecta === op && op !== ""
                      ? "bg-green-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  OK
                </button>
              </div>
            ))}
          </div>

          <textarea
            placeholder="Explicación (opcional)"
            className="w-full p-4 bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-accent outline-none text-slate-200 placeholder:text-slate-500"
            value={form.explicacion}
            onChange={(e) => setForm({ ...form, explicacion: e.target.value })}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent-light transition flex items-center justify-center gap-2"
        >
          <Save size={20} /> Guardar Pregunta
        </button>
      </div>
    </div>
  );
}
