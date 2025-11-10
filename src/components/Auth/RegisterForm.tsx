import { useRouter } from "next/navigation"
import React, { useState } from "react";

const RegisterForm: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        dni: '',
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || 'Registro exitoso. Serás notificado cuando tu cuenta sea activada.')
                router.push('/'); // Redirigimos a la página principal
            } else {
                setError(data.message || 'Error al enviar la solicitud.');
            }

        } catch (e) {
            setError('Error de red. No se pudo conectar con el servidor.')
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full pl-3 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700 transition duration-150 ease-in-out placeholder-gray-500 text-gray-800";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
                <p className="p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
                    {successMessage}
                </p>
            )}
            {error && (
                <p className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                    {error}
                </p>
            )}

            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ingrese su nombre" required className={inputClasses} />
            </div>

            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ingrese sus apellidos" required className={inputClasses} />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" required className={inputClasses} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">DNI con letra</label>
                    <input type="text" id="dni" value={formData.dni} onChange={handleChange} placeholder="DNI con letra" required className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                    <input type="date" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className={inputClasses} />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="Cree una contraseña" required className={inputClasses} />
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirme su contraseña" required className={inputClasses} />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-2 px-4 mt-6 rounded-full font-semibold text-white transition duration-200 ease-in-out ${
                    loading 
                    ? 'bg-yellow-400 cursor-not-allowed' 
                    : 'bg-yellow-700 hover:bg-yellow-800 shadow-md'
                }`}
            >
                {loading ? 'Enviando Solicitud...' : 'Registrarse'}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
                Haciendo click en registrarte aceptas nuestros <a href="#" className="font-medium text-yellow-700 hover:text-yellow-800">Términos de Servicio</a> y nuestra <a href="#" className="font-medium text-yellow-700 hover:text-yellow-800">Póliza de Privacidad</a>.
            </p>
        </form>
    );
};

export default RegisterForm;