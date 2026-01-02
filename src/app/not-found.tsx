import Link from "next/link";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-gray-100/50 rounded-full blur-3xl -z-10" />

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-12 shadow-sm border border-gray-100 text-center space-y-8 relative">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center relative">
            <MapPin className="text-red-500" size={40} />
            <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">x</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-black text-[#1a1c20] tracking-tighter">
            Error 404
          </h1>
          <h2 className="text-2xl font-bold text-[#d4af37]">
            Página no encontrada
          </h2>
        </div>

        <p className="text-gray-400 font-medium leading-relaxed max-w-xs mx-auto text-sm">
          Es posible que hayas introducido una dirección incorrecta o que la
          página haya sido movida.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#d4af37] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#b8962e] transition shadow-lg shadow-yellow-100 cursor-pointer"
          >
            <Home size={18} />
            Volver al Inicio
          </Link>
        </div>

        {/* Iconos decorativos inferiores */}
        <div className="flex justify-center gap-8 opacity-10 pt-4">
          <div className="w-6 h-6 border-2 border-gray-400 rounded-sm" />
          <div className="w-8 h-4 bg-gray-400 rounded-full mt-1" />
          <div className="w-6 h-6 border-2 border-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
