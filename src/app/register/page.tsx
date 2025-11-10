'use client';

import React from "react";
import RegisterForm from "@/components/Auth/RegisterForm";
import Link from "next/link";

const RegisterPage = () => {
    return (
        <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="p-8 md:p-10 bg-white rounded-2xl shadow-xl w-full max-w-2xl">
                
                <h1 className="text-center text-3xl font-bold text-gray-800 mb-2">Crea tu cuenta de estudiante</h1>
                <p className="text-center text-sm text-yellow-700 mb-8">
                    Un paso cada día. Un Test hoy, tu carnet mañana.
                </p>
                
                <RegisterForm />
                
                <p className="mt-8 text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta? 
                    <Link href="/login" className="font-semibold text-yellow-700 hover:text-yellow-800 ml-1">
                        Iniciar Sesión
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default RegisterPage;