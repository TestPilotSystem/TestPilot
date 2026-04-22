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
  const [mounted, setMounted]       = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { unreadCount, inboxPath } = useNotifications();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName   = mounted ? user?.username || "Usuario"        : "Usuario";
  const displayRole   = mounted ? user?.role     || "Invitado"       : "Invitado";
  const displayDni    = mounted ? user?.dni       || "No disponible"  : "---";
  const displayAvatar = mounted ? user?.avatarId  : null;
  const isAdmin       = displayRole === "ADMIN";
  const settingsPath  = isAdmin ? "/admin/ajustes" : "/estudiante/ajustes";

  return (
    <>
      <Toaster richColors position="top-right" />

      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-surface shrink-0">
        {/* Welcome */}
        <div>
          <h1 className="text-base font-bold text-fg-primary leading-none">
            Bienvenido de nuevo,{" "}
            <span className="text-accent-light">{displayName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-5">
          {/* Notifications */}
          <button
            onClick={() => router.push(inboxPath)}
            className="relative p-2 text-fg-muted hover:text-fg-primary hover:bg-surface-raised rounded-lg transition-all duration-[120ms] active:scale-95"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error rounded-full border border-surface flex items-center justify-center text-[9px] font-black text-white px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div
            className="flex items-center gap-3 pl-5 border-l border-border relative"
            ref={menuRef}
          >
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-[120ms]"
            >
              {/* Name + role */}
              <div className="text-right">
                <p className="text-sm font-bold text-fg-primary leading-none">{displayName}</p>
                <p className="text-[10px] text-fg-muted mt-1 uppercase tracking-widest font-semibold">
                  {displayRole}
                </p>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border border-brand/30 shrink-0">
                {displayAvatar ? (
                  <Image
                    src={`/avatars/${displayAvatar}.webp`}
                    alt="Avatar"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand-light font-bold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <ChevronDown
                size={15}
                className={`text-fg-muted transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Quick logout (visible when menu closed) */}
            <AnimatePresence>
              {!isMenuOpen && (
                <motion.button
                  key="logout-quick"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  onClick={logout}
                  className="p-2 text-fg-muted hover:text-error-light hover:bg-error/10 rounded-lg transition-all duration-[120ms] active:scale-95 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-2 w-72 bg-surface-raised rounded-2xl shadow-lg border border-border-strong overflow-hidden z-50"
                >
                  {/* User info header */}
                  <div className="p-5 bg-brand/8 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand/30 shrink-0">
                        {displayAvatar ? (
                          <Image
                            src={`/avatars/${displayAvatar}.webp`}
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand-light font-bold text-lg">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-fg-primary">{displayName}</p>
                        <p className="text-[10px] text-fg-muted uppercase tracking-widest font-semibold mt-0.5">
                          {isAdmin ? "Administrador" : "Estudiante"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center gap-2 text-xs text-fg-muted">
                      <User size={13} className="text-fg-subtle shrink-0" />
                      <span className="font-medium">DNI:</span>
                      <span className="text-fg-secondary font-mono">{displayDni}</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2 flex flex-col gap-0.5">
                    <button
                      onClick={() => { setIsMenuOpen(false); router.push(settingsPath); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-fg-secondary hover:text-fg-primary hover:bg-surface-overlay rounded-xl transition-all duration-[120ms] font-medium text-left"
                    >
                      <Settings size={16} className="text-fg-muted shrink-0" />
                      Ajustes de cuenta
                    </button>

                    {!isAdmin && (
                      <button
                        onClick={() => { setIsMenuOpen(false); setSupportOpen(true); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-fg-secondary hover:text-fg-primary hover:bg-surface-overlay rounded-xl transition-all duration-[120ms] font-medium text-left"
                      >
                        <Wrench size={16} className="text-fg-muted shrink-0" />
                        Contactar soporte
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-light hover:bg-error/8 rounded-xl transition-all duration-[120ms] font-medium text-left"
                    >
                      <LogOut size={16} className="shrink-0" />
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
