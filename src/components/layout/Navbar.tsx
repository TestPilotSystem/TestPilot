"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { name: "Inicio",          path: "/" },
  { name: "Estadísticas",    path: "/estadisticas" },
  { name: "Sobre nosotros",  path: "/about" },
  { name: "Contacto",        path: "/contact" },
];

const Navbar = () => {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
    >
      {/* Logo */}
      <div
        className="relative w-[130px] h-[42px] cursor-pointer flex items-center"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="TestPilot Logo"
          fill
          style={{ objectFit: "contain" }}
          priority
          className="opacity-90"
        />
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-7">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className="relative text-sm font-medium text-fg-muted hover:text-fg-primary transition-colors duration-[120ms] group"
          >
            {link.name}
            <span className="absolute inset-x-0 -bottom-0.5 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-[220ms] ease-out origin-left rounded-full" />
          </Link>
        ))}
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/register")}
          className="h-9 px-5 text-sm font-semibold text-fg-secondary border border-border-strong rounded-full hover:bg-surface-raised hover:text-fg-primary hover:border-border transition-all duration-[120ms] cursor-pointer"
        >
          Registrarse
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/login")}
          className="h-9 px-5 text-sm font-semibold text-white bg-brand hover:bg-brand-light rounded-full shadow-sm hover:shadow-brand transition-all duration-[120ms] cursor-pointer"
        >
          Iniciar sesión
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
