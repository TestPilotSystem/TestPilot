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

const menuItems = [
  { name: "Inicio",          icon: Home,          href: "/estudiante/inicio" },
  { name: "Tests",           icon: FileText,       href: "/estudiante/driving-tests" },
  { name: "Progreso",        icon: BarChart2,      href: "/estudiante/progreso" },
  { name: "Tutor Virtual",   icon: MessageSquare,  href: "/estudiante/tutor" },
  { name: "Flashcards",      icon: Layers,         href: "/estudiante/flashcards" },
  { name: "Notificaciones",  icon: Bell,           href: "/estudiante/notificaciones" },
];

function NavItem({ href, icon: Icon, name, active }: {
  href:   string;
  icon:   React.ElementType;
  name:   string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-sm",
        "transition-all duration-[120ms] group",
        active
          ? "bg-brand/10 text-brand-light"
          : "text-fg-muted hover:bg-surface-raised hover:text-fg-primary",
      ].join(" ")}
    >
      {/* Active left indicator */}
      {active && (
        <span className="absolute left-0 inset-y-2.5 w-0.5 rounded-full bg-brand-light" />
      )}

      <Icon
        size={19}
        className={active ? "text-brand-light" : "text-fg-subtle group-hover:text-fg-secondary transition-colors duration-[120ms]"}
      />
      {name}
    </Link>
  );
}

const SideBarStudent = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen bg-surface border-r border-border flex flex-col p-5 overflow-y-auto">
      {/* Logo */}
      <div className="mb-10 flex justify-center pt-2">
        <Image
          src="/logo.png"
          alt="TestPilot"
          width={110}
          height={110}
          className="object-contain opacity-90"
        />
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            name={item.name}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Settings — bottom */}
      <div className="pt-4 border-t border-border">
        <NavItem
          href="/estudiante/ajustes"
          icon={Settings}
          name="Ajustes"
          active={pathname === "/estudiante/ajustes"}
        />
      </div>
    </aside>
  );
};

export default SideBarStudent;
