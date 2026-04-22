"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  NotebookText,
  Users,
  Activity,
  Wrench,
  Bell,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Inicio",          icon: Home,         href: "/admin/inicio" },
  { name: "Tests",           icon: FileText,      href: "/admin/driving-tests" },
  { name: "Temario",         icon: NotebookText,  href: "/admin/docs" },
  { name: "Usuarios",        icon: Users,         href: "/admin/users" },
  { name: "Seguimiento",     icon: Activity,      href: "/admin/seguimiento" },
  { name: "Configurar IA",   icon: Wrench,        href: "/admin/ai/config" },
  { name: "Notificaciones",  icon: Bell,          href: "/admin/notificaciones" },
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

const SidebarAdmin = () => {
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
          href="/admin/ajustes"
          icon={Settings}
          name="Ajustes"
          active={pathname === "/admin/ajustes"}
        />
      </div>
    </aside>
  );
};

export default SidebarAdmin;
