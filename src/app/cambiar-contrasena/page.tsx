'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LockKeyhole } from "lucide-react";
import Link from 'next/link';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [status, setStatus] = useState({ message: '', isError: false });
    const { user, login } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmNewPassword) {
            setStatus({ message: 'Las contraseñas no coinciden', isError: true });
            return;
        }

        setStatus({ message: 'Procesando...', isError: false });

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ message: 'Contraseña actualizada. Redirigiendo...', isError: false });
                
                const role = user?.role || 'ADMIN';
                const redirectPath = role === 'ADMIN' ? '/admin/inicio' : '/estudiante/inicio';

                router.refresh(); 
                setTimeout(() => router.push(redirectPath), 1500);
            } else {
                setStatus({ message: data.message || 'Error al cambiar contraseña', isError: true });
            }
        } catch (error) {
            setStatus({ message: 'Error de conexión con el servidor', isError: true });
        }
    };

    const isMandatory = user?.mustChangePassword;

    return (
        <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-50">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-yellow-50 p-4 rounded-full">
                        <LockKeyhole className="text-yellow-700" size={32} />
                    </div>
                </div>
                
                {/* Headers */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Cambiar Contraseña</h2>
                <p className={`text-sm mb-8 ${isMandatory ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {isMandatory 
                        ? "Por motivos de seguridad, es obligatorio que cambies tu contraseña antes de continuar." 
                        : "Actualiza tu contraseña para mantener tu cuenta segura."}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Contraseña Actual</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Nueva Contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {status.message && (
                        <p className={`text-xs mt-2 ml-1 font-medium ${status.isError ? 'text-red-500' : 'text-green-500'}`}>
                            {status.message}
                        </p>
                    )}

                    <button 
                        type="submit" 
                        className="w-full bg-yellow-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-yellow-800 transition shadow-lg shadow-yellow-700/20 mt-4"
                    >
                        Actualizar Contraseña
                    </button>
                    
                     {!isMandatory && (
                         <div className="mt-6 text-center">
                            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">
                                Cancelar y volver
                            </Link>
                         </div>
                     )}
                </form>
            </div>
        </main>
    );

}

export default ChangePasswordPage;
