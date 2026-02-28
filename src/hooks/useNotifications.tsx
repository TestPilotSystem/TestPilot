"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const POLL_INTERVAL = 30000;

interface NotificationContextType {
  unreadCount: number;
  markAsRead: (notificationId?: string) => Promise<void>;
  refresh: () => void;
  inboxPath: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCountRef = useRef(-1);
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const inboxPath = isAdmin ? "/admin/notificaciones" : "/estudiante/notificaciones";

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      const newCount = data.count;

      if (newCount > lastCountRef.current && lastCountRef.current !== -1) {
        const diff = newCount - lastCountRef.current;
        toast.info(
          `${diff === 1 ? "Nueva notificación" : `${diff} nuevas notificaciones`}`,
          {
            description: "Haz clic para ver tu buzón",
            action: {
              label: "Ver",
              onClick: () => {
                router.push(inboxPath);
                router.refresh();
              },
            },
            duration: 6000,
          }
        );
      }

      lastCountRef.current = newCount;
      setUnreadCount(newCount);
    } catch (error) {
      /* Polling errors might not appear in logs */
    }
  }, [router, inboxPath]);

  useEffect(() => {
    if (!user) return;

    lastCountRef.current = -1;
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      const body = notificationId
        ? { notificationId }
        : { markAllRead: true };

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!notificationId) {
        setUnreadCount(0);
        lastCountRef.current = 0;
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        lastCountRef.current = Math.max(0, lastCountRef.current - 1);
      }
    } catch (error) {
      /* Polling errors might not appear in logs */
    }
  }, []);

  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, markAsRead, refresh, inboxPath }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de un NotificationProvider");
  }
  return context;
}
