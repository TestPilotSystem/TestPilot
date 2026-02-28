import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/hooks/useNotifications";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased bg-[#0F172A] text-slate-50">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}