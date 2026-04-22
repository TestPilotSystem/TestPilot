import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/hooks/useNotifications";
import "./globals.css";

/* ── Display / Headings ──────────────────────────────────────
   Syne: architectural, geometric, unmistakably distinctive.
   Tight letter-spacing gives headings real authority.         */
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

/* ── Body ────────────────────────────────────────────────────
   DM Sans: clean and modern without being overused.
   Optical sizing keeps text sharp at every scale.             */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

/* ── Monospace ───────────────────────────────────────────────
   JetBrains Mono: for question counters, timers, codes.      */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-code",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-background text-foreground font-sans">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
