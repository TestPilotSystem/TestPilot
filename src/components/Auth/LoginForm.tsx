"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Car, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const LoginForm = () => {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({
          username:           data.user.firstName,
          role:               data.user.role,
          email:              data.user.email,
          dni:                data.user.dni,
          avatarId:           data.user.avatarId,
          mustChangePassword: data.user.mustChangePassword,
        });
        router.push("/admin/inicio");
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full px-4 py-3 bg-surface border border-border-strong rounded-xl text-sm text-fg-primary placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all duration-[120ms] disabled:opacity-50 disabled:cursor-not-allowed";
  const label =
    "block text-[10px] font-black text-fg-muted uppercase tracking-widest mb-1.5";

  return (
    <div className="bg-surface-raised rounded-2xl border border-border shadow-lg overflow-hidden w-full max-w-md">
      {/* Top gradient strip — same as RegisterPage */}
      <div className="h-0.5 bg-gradient-to-r from-brand via-brand-light to-accent" />

      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 bg-brand/10 text-brand-light rounded-xl border border-brand/20 mb-5">
            <Car size={24} />
          </div>
          <h2 className="text-2xl font-bold text-fg-primary mb-1.5">
            Arranca el viaje
          </h2>
          <p className="text-sm text-fg-muted">
            Inicia sesión o solicita acceso a un{" "}
            <span className="text-brand-light font-semibold">administrador.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-error/8 border border-error/20 rounded-xl">
              <AlertCircle size={15} className="text-error-light shrink-0 mt-0.5" />
              <p className="text-sm text-error-light">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
              className={field}
            />
          </div>

          {/* Password */}
          <div>
            <label className={label}>Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className={`${field} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg-secondary transition-colors duration-[120ms]"
                tabIndex={-1}
              >
                <div className="relative w-4 h-4">
                  <EyeOff
                    size={16}
                    className={`absolute inset-0 transition-all duration-300 ${
                      showPassword ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`}
                  />
                  <Eye
                    size={16}
                    className={`absolute inset-0 transition-all duration-300 ${
                      showPassword ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-brand hover:bg-brand-light active:bg-brand-dark text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-brand transition-all duration-[120ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-fg-muted">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-bold text-accent hover:text-accent-light transition-colors duration-[120ms]"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
