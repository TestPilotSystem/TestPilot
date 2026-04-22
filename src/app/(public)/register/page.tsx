"use client";

import RegisterForm from "@/components/Auth/RegisterForm";
import Link from "next/link";
import { UserPlus } from "lucide-react";

const RegisterPage = () => {
  return (
    <main className="flex justify-center items-start min-h-screen px-4 pt-24 pb-16">
      <div className="w-full max-w-lg">

        <div className="bg-surface-raised rounded-2xl border border-border shadow-lg overflow-hidden">
          {/* Top gradient strip — same pattern as modals */}
          <div className="h-0.5 bg-gradient-to-r from-brand via-brand-light to-accent" />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-3.5 bg-brand/10 text-brand-light rounded-xl border border-brand/20 mb-5">
                <UserPlus size={24} />
              </div>
              <h1 className="text-2xl font-bold text-fg-primary mb-1.5">
                Crea tu cuenta
              </h1>
              <p className="text-sm text-fg-muted">
                Un test hoy,{" "}
                <span className="text-brand-light font-semibold">tu carnet mañana.</span>
              </p>
            </div>

            <RegisterForm />

            <p className="mt-7 text-center text-sm text-fg-muted">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-accent hover:text-accent-light transition-colors duration-[120ms]"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
};

export default RegisterPage;
