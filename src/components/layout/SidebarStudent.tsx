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
  Settings,
} from "lucide-react";

const SideBarStudent = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Inicio", icon: Home, href: "/estudiante/inicio" },
    { name: "Tests", icon: FileText, href: "/estudiante/tests" },
    { name: "Progreso", icon: BarChart2, href: "/estudiante/progreso" },
    { name: "Tutor Virtual", icon: MessageSquare, href: "/estudiante/tutor" },
    { name: "Flashcards", icon: Layers, href: "/estudiante/flashcards" },
  ];

  return (
    <aside className="w-72 h-screen border-r border-gray-100 flex flex-col p-6 sticky top-0 bg-white">
      <div className="mb-12 flex justify-center">
        <Image
          src="/logo.png"
          alt="TestPilot"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition cursor-pointer ${
                isActive
                  ? "bg-yellow-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <Link
          href="/estudiante/ajustes"
          className="flex items-center gap-4 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition cursor-pointer"
        >
          <Settings size={22} />
          Ajustes
        </Link>
      </div>
    </aside>
  );
};

export default SideBarStudent;
