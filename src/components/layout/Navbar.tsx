"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Navbar = () => {
  const router = useRouter();

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-r from-stone-50/90 via-orange-50/90 to-yellow-50/90 backdrop-blur-md border-b-2 border-amber-200/50 shadow-sm transition-all duration-300"
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
        <div className="relative w-[150px] h-[50px] rounded-full overflow-hidden flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="TestPilot Logo" 
                layout="fill"
                objectFit="contain"
                priority 
                className="opacity-90 mix-blend-multiply" 
              />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-amber-900/80 font-medium">
        {[
          { name: "Inicio", path: "/" },
          { name: "Sobre nosotros", path: "/about" },
          { name: "Contacto", path: "/contacto" }
        ].map((link) => (
          <Link key={link.path} href={link.path} className="relative group hover:text-amber-700 transition-colors">
            {link.name}
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/register')}
          className="px-6 py-2 text-amber-900 font-semibold border border-amber-600/50 rounded-full hover:bg-amber-100/50 transition-colors cursor-pointer"
        >
          Registrarse
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-amber-700 text-white font-semibold rounded-full hover:from-yellow-700 hover:to-amber-800 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Iniciar sesión
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
