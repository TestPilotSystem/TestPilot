"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  role: string;
  email?: string;
  dni?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("testpilot_user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [loading] = useState(false);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("testpilot_user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call to clear server-side session/cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor");
    } finally {
      // Clean up client-side state
      setUser(null);
      localStorage.removeItem("testpilot_user");

      // Make sure to redirect to login page
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
