"use client";

import { Bell, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: {
    firstName: string;
    role: string;
  };
}

const DashboardHeader = ({ user }: HeaderProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
        router.push('/login');
        router.refresh();
    }
  };

  return (
    <header className="flex items-center justify-between p-8 bg-transparent">
      <h1 className="text-3xl font-bold text-gray-800">
        ¡Bienvenido de nuevo, <span className="text-yellow-700">{user.firstName}</span>!
      </h1>

      <div className="flex items-center gap-6">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition">
          <Bell size={24} />
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="text-right">
            <p className="font-bold text-gray-800 leading-none">{user.firstName}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-full text-gray-600">
            <User size={24} />
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-red-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;