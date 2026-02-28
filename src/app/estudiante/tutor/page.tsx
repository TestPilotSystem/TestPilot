"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Sparkles, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/estudiante/chat");
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error loading chat history");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/estudiante/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Lo siento, no he podido procesar tu pregunta.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ha ocurrido un error al conectar con el tutor. Inténtalo de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/estudiante/chat", { method: "DELETE" });
      if (response.ok) {
        setMessages([]);
        setIsClearModalOpen(false);
      }
    } catch (error) {
      console.error("Error clearing chat");
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoadingHistory) {
    return (
      <main className="min-h-screen bg-[#0F172A] pt-24 pb-8 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] pt-24 pb-8 px-4">
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-brand/20 rounded-full blur-[80px] -z-10" />
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-light tracking-tight">
              Tutor IA
            </h1>
          </div>
          <p className="text-slate-400">
            Pregunta cualquier duda sobre educación vial
          </p>
        </motion.div>

        <div className="flex-1 bg-surface/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-700/50 overflow-hidden flex flex-col">
          {messages.length > 0 && (
            <div className="flex justify-end p-3 border-b border-slate-700/50">
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar chat
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center text-slate-500"
              >
                <Bot className="w-16 h-16 mb-4 text-brand/40" />
                <p className="text-lg font-medium text-slate-300">¡Hola! Soy tu tutor de autoescuela.</p>
                <p className="text-sm mt-1">Escribe tu pregunta para comenzar.</p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-accent text-white shadow-md"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800 px-4 py-3 rounded-2xl">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-slate-700/50 bg-surface/50"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition-all shadow-md shadow-accent/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearChat}
        title="¿Limpiar conversación?"
        description="Se borrará toda la memoria de la conversación y la IA no podrá seguir el contexto anterior."
        confirmText="Limpiar"
        loading={isClearing}
      />
    </main>
  );
}
