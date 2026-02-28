"use client";

import { useEffect, useState, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell,
  CheckCheck,
  Loader2,
  Mail,
  MailOpen,
  ShieldCheck,
  ShieldX,
  MessageSquare,
  FileBarChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  ACCOUNT_APPROVED: { icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/10" },
  ACCOUNT_REJECTED: { icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10" },
  ADMIN_MESSAGE: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
  TEST_SUMMARY: { icon: FileBarChart, color: "text-purple-400", bg: "bg-purple-500/10" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function NotificationInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { markAsRead, refresh, unreadCount: contextUnreadCount } = useNotifications();

  const fetchNotifications = useCallback(async () => {
    try {
      const params = filter === "unread" ? "?filter=unread" : "";
      const res = await fetch(`/api/notifications${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (contextUnreadCount >= 0) {
      fetchNotifications();
    }
  }, [contextUnreadCount]);

  const handleSelect = async (notification: Notification) => {
    setSelectedId(notification.id);
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    await markAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refresh();
  };

  const selected = notifications.find((n) => n.id === selectedId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-50 tracking-tight">
            Notificaciones
          </h1>
          <p className="text-slate-400 font-medium">
            {unreadCount > 0
              ? `Tienes ${unreadCount} sin leer`
              : "Estás al día"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-surface rounded-xl border border-slate-700/50 overflow-hidden">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-bold transition ${
                filter === "all"
                  ? "bg-accent text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 text-sm font-bold transition ${
                filter === "unread"
                  ? "bg-accent text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sin leer
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-accent-light hover:bg-accent/10 rounded-xl transition"
            >
              <CheckCheck size={16} />
              Marcar todas
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-slate-700/50 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Bell size={40} className="text-slate-600" />
              <p className="text-slate-500 font-medium">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30 max-h-[70vh] overflow-y-auto">
              {notifications.map((n) => {
                const config = typeConfig[n.type] || typeConfig.ADMIN_MESSAGE;
                const Icon = config.icon;
                const isSelected = selectedId === n.id;

                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(n)}
                    className={`w-full text-left p-5 transition hover:bg-slate-800/50 ${
                      isSelected ? "bg-slate-800/70 border-l-2 border-accent" : ""
                    } ${!n.read ? "bg-accent/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${config.bg} shrink-0 mt-0.5`}>
                        <Icon size={16} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold truncate ${
                            n.read ? "text-slate-400" : "text-slate-100"
                          }`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 bg-accent rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">{n.body}</p>
                        <p className="text-[10px] text-slate-600 mt-2 font-medium">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-surface rounded-[2.5rem] border border-slate-700/50 p-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  {(() => {
                    const config = typeConfig[selected.type] || typeConfig.ADMIN_MESSAGE;
                    const Icon = config.icon;
                    return (
                      <div className={`p-3 rounded-2xl ${config.bg}`}>
                        <Icon size={24} className={config.color} />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {selected.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(selected.createdAt).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selected.body}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[40vh] gap-3"
              >
                <MailOpen size={48} className="text-slate-700" />
                <p className="text-slate-500 font-medium">
                  Selecciona una notificación para leerla
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
