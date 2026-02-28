"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Car, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({
          username: data.user.firstName,
          role: data.user.role,
          email: data.user.email,
          dni: data.user.dni,
          avatarId: data.user.avatarId,
          mustChangePassword: data.user.mustChangePassword,
        });
        router.push("/admin/inicio");
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error de conexión");
    }
  };

  return (
    <div className="bg-[#1E293B] p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-700/50 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-brand/20 p-4 rounded-full">
          <Car className="text-brand-light" size={32} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-slate-50 mb-2">Arranca el viaje</h2>
      <p className="text-slate-400 text-sm mb-8">Inicia sesión o solicita acceso a un administrador aquí.</p>

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1 tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-slate-200 placeholder:text-slate-500"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1 tracking-wider">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-slate-200 pr-12 placeholder:text-slate-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
            >
              <div className="relative w-5 h-5">
                <EyeOff
                  size={20}
                  className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${
                    showPassword ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`}
                />
                <Eye
                  size={20}
                  className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${
                    showPassword ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mt-2 ml-1 font-medium">{error}</p>}

        <button
          type="submit"
          className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg hover:bg-accent-light transition shadow-lg shadow-accent/20 mt-4"
        >
          Entrar
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-400">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="text-accent font-bold hover:underline transition">
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;