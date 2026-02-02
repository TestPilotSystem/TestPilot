"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, LogOut, Settings, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = mounted ? user?.username || "Usuario" : "Usuario";
  const displayRole = mounted ? user?.role || "Invitado" : "Invitado";
  const displayDni = mounted ? user?.dni || "No disponible" : "---";
  const isAdmin = displayRole === "ADMIN";
  const settingsPath = isAdmin ? "/admin/ajustes" : "/estudiante/ajustes";

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Bienvenido de nuevo,{" "}
          <span className="text-yellow-700">{displayName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-gray-600 cursor-pointer">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-100 relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 leading-none">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter font-semibold">
                {displayRole}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold border border-yellow-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
            />
          </button>

          <AnimatePresence>
            {!isMenuOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-xl border-2 border-yellow-200">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{displayName}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                        {displayRole === "ADMIN" ? "Administrador" : "Estudiante"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span className="font-medium">DNI:</span>
                    <span className="text-gray-800">{displayDni}</span>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push(settingsPath);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
                  >
                    <Settings size={18} className="text-gray-400" />
                    Ajustes de cuenta
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                  >
                    <LogOut size={18} />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
