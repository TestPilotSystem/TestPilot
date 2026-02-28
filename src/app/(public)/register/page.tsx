'use client';

import React from "react";
import RegisterForm from "@/components/Auth/RegisterForm";
import Link from "next/link";

const RegisterPage = () => {
    return (
    <main className="flex justify-center items-start min-h-screen bg-[#0F172A] px-4 pt-28 pb-12">
            <div className="p-8 md:p-10 bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-2xl border border-slate-700/50 max-h-[95vh] overflow-y-auto">

                <h1 className="text-center text-3xl font-bold text-slate-50 mb-2">Crea tu cuenta de estudiante</h1>
                <p className="text-center text-sm text-brand-light mb-8">
                    Un paso cada día. Un Test hoy, tu carnet mañana.
                </p>

                <RegisterForm />

                <p className="mt-8 text-center text-sm text-slate-400">
                    ¿Ya tienes una cuenta?
                    <Link href="/login" className="font-semibold text-accent hover:text-accent-light ml-1">
                        Iniciar Sesión
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default RegisterPage;