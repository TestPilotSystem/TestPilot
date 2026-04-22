"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dni:             "",
    firstName:       "",
    lastName:        "",
    email:           "",
    dateOfBirth:     "",
    password:        "",
    confirmPassword: "",
  });
  const [error,          setError]          = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading,        setLoading]        = useState(false);
  const [showPassword,   setShowPassword]   = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          data.message || "Registro exitoso. Serás notificado cuando tu cuenta sea activada.",
        );
        router.push("/");
      } else {
        setError(data.message || "Error al enviar la solicitud.");
      }
    } catch {
      setError("Error de red. No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full px-4 py-3 bg-surface border border-border-strong rounded-xl text-sm text-fg-primary placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all duration-[120ms] disabled:opacity-50 disabled:cursor-not-allowed";
  const label =
    "block text-[10px] font-black text-fg-muted uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Feedback ───────────────────────────────────────── */}
      {successMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-success/8 border border-success/20 rounded-xl">
          <CheckCircle size={15} className="text-success-light shrink-0 mt-0.5" />
          <p className="text-sm text-success-light">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-error/8 border border-error/20 rounded-xl">
          <AlertCircle size={15} className="text-error-light shrink-0 mt-0.5" />
          <p className="text-sm text-error-light">{error}</p>
        </div>
      )}

      {/* ── Name ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className={label}>Nombre</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Tu nombre"
            required
            disabled={loading}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={label}>Apellidos</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Tus apellidos"
            required
            disabled={loading}
            className={field}
          />
        </div>
      </div>

      {/* ── Email ──────────────────────────────────────────── */}
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          required
          disabled={loading}
          className={field}
        />
      </div>

      {/* ── DNI + Birthdate ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dni" className={label}>DNI con letra</label>
          <input
            type="text"
            id="dni"
            value={formData.dni}
            onChange={handleChange}
            placeholder="12345678Z"
            required
            disabled={loading}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth" className={label}>Fecha de nacimiento</label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            disabled={loading}
            className={`${field} [color-scheme:dark]`}
          />
        </div>
      </div>

      {/* ── Password ───────────────────────────────────────── */}
      <PasswordField
        id="password"
        label="Contraseña"
        value={formData.password}
        onChange={handleChange}
        placeholder="Crea una contraseña"
        show={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        disabled={loading}
        fieldClass={field}
        labelClass={label}
      />

      {/* ── Confirm password ───────────────────────────────── */}
      <PasswordField
        id="confirmPassword"
        label="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Repite tu contraseña"
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        disabled={loading}
        fieldClass={field}
        labelClass={label}
      />

      {/* ── Submit ─────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-brand hover:bg-brand-light active:bg-brand-dark text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-brand transition-all duration-[120ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Enviando solicitud..." : "Crear cuenta"}
      </button>

      <p className="text-center text-xs text-fg-subtle pt-1">
        Al registrarte aceptas nuestros{" "}
        <a href="#" className="text-fg-muted hover:text-accent transition-colors duration-[120ms]">
          Términos de Servicio
        </a>{" "}
        y nuestra{" "}
        <a href="#" className="text-fg-muted hover:text-accent transition-colors duration-[120ms]">
          Política de Privacidad
        </a>
        .
      </p>
    </form>
  );
};

/* ── Shared password field with animated show/hide toggle ── */
function PasswordField({
  id, label: labelText, value, onChange, placeholder,
  show, onToggle, disabled, fieldClass, labelClass,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  disabled: boolean;
  fieldClass: string;
  labelClass: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{labelText}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          disabled={disabled}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg-secondary transition-colors duration-[120ms]"
          tabIndex={-1}
        >
          <div className="relative w-4 h-4">
            <EyeOff
              size={16}
              className={`absolute inset-0 transition-all duration-300 ${
                show ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
              }`}
            />
            <Eye
              size={16}
              className={`absolute inset-0 transition-all duration-300 ${
                show ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
