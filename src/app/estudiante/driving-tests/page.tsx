"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Loader2,
  Check,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

type TestType = "BASIC" | "ERROR" | "CUSTOM";

interface TestItem {
  id: string;
  type: TestType;
  topic: { name: string };
  _count: { questions: number };
}

const TYPE_CONFIG: Record<
  TestType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  BASIC: {
    label: "Tests Básicos",
    icon: <BookOpen size={16} />,
    color: "yellow",
  },
  ERROR: {
    label: "Tests de Errores",
    icon: <AlertTriangle size={16} />,
    color: "red",
  },
  CUSTOM: {
    label: "Tests Personalizados",
    icon: <Sparkles size={16} />,
    color: "purple",
  },
};

export default function StudentTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<TestType[]>([
    "BASIC",
    "ERROR",
    "CUSTOM",
  ]);

  const fetchTests = useCallback(async () => {
    if (selectedTypes.length === 0) {
      setTests([]);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTypes.length < 3) {
      params.set("types", selectedTypes.join(","));
    }

    const url = `/api/student/driving-tests${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setTests(data);
    setLoading(false);
  }, [search, selectedTypes]);

  const regenerateErrorTests = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/student/error-tests/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchTests();
      } else {
        toast.error(data.message || "Error al generar tests");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setRefreshing(false);
    }
  };

  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const generateCustomTest = async () => {
    setGeneratingCustom(true);
    try {
      const res = await fetch("/api/student/custom-tests/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setShowCustomModal(false);
        toast.success(data.message);
        fetchTests();
      } else if (res.status === 429) {
        toast.error(
          "Has excedido el límite de generación. Inténtalo de nuevo más tarde.",
        );
      } else {
        toast.error(data.message || "Error al generar test personalizado");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servicio de IA");
    } finally {
      setGeneratingCustom(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTests]);

  const toggleType = (type: TestType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const getTypeIcon = (type: TestType) => {
    switch (type) {
      case "ERROR":
        return <AlertTriangle size={28} className="text-red-400" />;
      case "CUSTOM":
        return <Sparkles size={28} className="text-brand-light" />;
      default:
        return <BookOpen size={28} />;
    }
  };

  const getTypeStyles = (type: TestType) => {
    switch (type) {
      case "ERROR":
        return {
          icon: "bg-red-500/10 text-red-400",
          badge: "bg-red-500/10 text-red-400 border-red-500/20",
          button: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
        };
      case "CUSTOM":
        return {
          icon: "bg-brand/20 text-brand-light",
          badge: "bg-brand/10 text-brand-light border-brand/20",
          button: "bg-brand hover:bg-brand-light shadow-brand/20",
        };
      default:
        return {
          icon: "bg-accent/10 text-accent",
          badge: "bg-slate-700/50 text-slate-400 border-slate-600/50",
          button: "bg-accent hover:bg-accent-light shadow-accent/20",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
<main className="p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight">
            Tests Disponibles 🚗
          </h1>
          <p className="text-slate-400 font-medium">
            Selecciona una categoría y demuestra lo que sabes.
          </p>
        </header>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface border border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition font-medium text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={regenerateErrorTests}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition cursor-pointer active:scale-95"
            title="Refrescar tests de errores"
          >
            <RefreshCw size={24} />
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            disabled={generatingCustom}
            className="p-4 bg-brand/10 border border-brand/20 rounded-2xl text-brand-light hover:bg-brand/20 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generar test personalizado con IA"
          >
            {generatingCustom ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Sparkles size={24} />
            )}
          </button>

          <ConfirmModal
            isOpen={showCustomModal}
            onClose={() => setShowCustomModal(false)}
            onConfirm={generateCustomTest}
            title="Generar Test con IA"
            description="Los tests personalizados son generados por inteligencia artificial y pueden contener errores. En caso de dudas, contacta con soporte."
            confirmText="Generar Test"
            loading={generatingCustom}
            loadingText="Generando..."
            icon={<Sparkles size={32} />}
            iconBgClass="bg-brand/20"
            iconTextClass="text-brand-light"
            confirmButtonClass="bg-brand hover:bg-brand-light"
          />

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 bg-surface border rounded-2xl transition cursor-pointer ${
                showFilters
                  ? "border-accent text-accent"
                  : "border-slate-700/50 text-slate-500 hover:text-accent"
              }`}
            >
              <Filter size={24} />
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl border border-slate-700/50 shadow-xl z-50 p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Tipos de Test
                </p>
                {(Object.keys(TYPE_CONFIG) as TestType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800 transition"
                  >
                    <div
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition"
                      style={{
                        backgroundColor: selectedTypes.includes(type)
                          ? type === "BASIC"
                            ? "#2563EB"
                            : type === "ERROR"
                              ? "#ef4444"
                              : "#5A2A82"
                          : "transparent",
                        borderColor: selectedTypes.includes(type)
                          ? type === "BASIC"
                            ? "#2563EB"
                            : type === "ERROR"
                              ? "#ef4444"
                              : "#5A2A82"
                          : "#475569",
                      }}
                    >
                      {selectedTypes.includes(type) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="hidden"
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      {TYPE_CONFIG[type].icon}
                      {TYPE_CONFIG[type].label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-slate-700/50">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">
              No se encontraron tests con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map((test) => {
              const styles = getTypeStyles(test.type);
              return (
                <div
                  key={test.id}
                  className="bg-surface p-6 rounded-[2.5rem] border border-slate-700/50 hover:border-slate-600 hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-14 h-14 ${styles.icon} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300`}
                    >
                      {getTypeIcon(test.type)}
                    </div>
                    <span
                      className={`${styles.badge} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border`}
                    >
                      {test._count.questions} Preguntas
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 mb-2 leading-tight">
                    {test.topic?.name ?? "Sin tema"}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">
                    {test.type === "ERROR"
                      ? "Repasa las preguntas que has fallado anteriormente."
                      : test.type === "CUSTOM"
                        ? "Test personalizado generado por IA según tu progreso."
                        : "Domina este bloque de contenido practicando con preguntas reales de examen."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-700/30">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                      <Clock size={14} className="text-accent" />
                      30 min
                    </div>
                    <Link
                      href={`/estudiante/driving-tests/${test.id}`}
                      className={`${styles.button} text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg cursor-pointer active:scale-95`}
                    >
                      Empezar Test
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
