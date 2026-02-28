"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  BarChart2,
  MessageSquare,
  Layers,
  Bell,
  Settings,
} from "lucide-react";

const SideBarStudent = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Inicio", icon: Home, href: "/estudiante/inicio" },
    { name: "Tests", icon: FileText, href: "/estudiante/driving-tests" },
    { name: "Progreso", icon: BarChart2, href: "/estudiante/progreso" },
    { name: "Tutor Virtual", icon: MessageSquare, href: "/estudiante/tutor" },
    { name: "Flashcards", icon: Layers, href: "/estudiante/flashcards" },
    { name: "Notificaciones", icon: Bell, href: "/estudiante/notificaciones" },
  ];

  return (
    <aside className="w-72 shrink-0 h-screen bg-[#0F172A] border-r border-slate-700/50 flex flex-col p-6 overflow-y-auto">
      <div className="mb-12 flex justify-center">
        <Image
          src="/logo.png"
          alt="TestPilot"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-700/50">
        <Link
          href="/estudiante/ajustes"
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition cursor-pointer ${
            pathname === "/estudiante/ajustes"
              ? "bg-brand text-white shadow-lg shadow-brand/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Settings size={22} />
          Ajustes
        </Link>
      </div>
    </aside>
  );
};

export default SideBarStudent;
