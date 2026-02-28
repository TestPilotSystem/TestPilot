"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, LogOut, Settings, ChevronDown, User, Wrench } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useNotifications } from "@/hooks/useNotifications";
import { Toaster } from "sonner";
import ContactSupportModal from "@/components/notifications/ContactSupportModal";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { unreadCount, inboxPath } = useNotifications();
  const [supportOpen, setSupportOpen] = useState(false);

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
  const displayAvatar = mounted ? user?.avatarId : null;
  const isAdmin = displayRole === "ADMIN";
  const settingsPath = isAdmin ? "/admin/ajustes" : "/estudiante/ajustes";

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <Toaster richColors position="top-right" />
    <header className="h-20 border-b border-slate-700/50 flex items-center justify-between px-8 bg-[#1E293B]">
      <div>
        <h1 className="text-xl font-bold text-slate-50">
          Bienvenido de nuevo,{" "}
          <span className="text-accent-light">{displayName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push(inboxPath)}
          className="relative text-slate-400 hover:text-slate-200 cursor-pointer transition"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#1E293B] flex items-center justify-center text-[10px] font-bold text-white px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-700/50 relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-slate-50 leading-none">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-semibold">
                {displayRole}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-brand-light/50">
              {displayAvatar ? (
                <Image
                  src={`/avatars/${displayAvatar}.webp`}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand flex items-center justify-center text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
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
                className="ml-2 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
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
                className="absolute right-0 top-full mt-2 w-72 bg-[#1E293B] rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden z-50"
              >
                <div className="p-5 bg-brand/20 border-b border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-light/50">
                      {displayAvatar ? (
                        <Image
                          src={`/avatars/${displayAvatar}.webp`}
                          alt="Avatar"
                          width={56}
                          height={56}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand flex items-center justify-center text-white font-bold text-xl">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-50 text-lg">{displayName}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                        {displayRole === "ADMIN" ? "Administrador" : "Estudiante"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                    <User size={14} className="text-slate-500" />
                    <span className="font-medium">DNI:</span>
                    <span className="text-slate-200">{displayDni}</span>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push(settingsPath);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl transition font-medium"
                  >
                    <Settings size={18} className="text-slate-500" />
                    Ajustes de cuenta
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setSupportOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl transition font-medium"
                    >
                      <Wrench size={18} className="text-slate-500" />
                      Contactar soporte
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition font-medium"
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
    <ContactSupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
};

export default DashboardHeader;
