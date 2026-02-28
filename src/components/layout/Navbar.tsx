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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-black/10"
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
        <div className="relative w-[150px] h-[50px] rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="TestPilot Logo"
                layout="fill"
                objectFit="contain"
                priority
                className="opacity-90"
              />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-slate-400 font-medium">
        {[
          { name: "Inicio", path: "/" },
          { name: "Sobre nosotros", path: "/about" },
          { name: "Contacto", path: "/contact" }
        ].map((link) => (
          <Link key={link.path} href={link.path} className="relative group hover:text-slate-100 transition-colors">
            {link.name}
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/register')}
          className="px-6 py-2 text-slate-300 font-semibold border border-slate-600 rounded-full hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
        >
          Registrarse
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-semibold rounded-full shadow-md shadow-accent/20 hover:shadow-lg transition-all cursor-pointer"
        >
          Iniciar sesión
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
