"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="TestPilot Logo" width={150} height={50} priority />
      </div>

      <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
        <Link href="/" className="hover:text-yellow-700 transition">Inicio</Link>
        <Link href="/sobre-nosotros" className="hover:text-yellow-700 transition">Sobre nosotros</Link>
        <Link href="/contacto" className="hover:text-yellow-700 transition">Contacto</Link>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/register')}
          className="px-6 py-2 text-yellow-800 font-semibold border border-yellow-700 rounded-full hover:bg-yellow-50 transition"
        >
          Registrarse
        </button>
        <button 
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-yellow-700 text-white font-semibold rounded-full hover:bg-yellow-800 shadow-md transition"
        >
          Iniciar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;