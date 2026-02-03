"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Search, Filter, Clock, Loader2, Check, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TestType = "BASIC" | "ERROR" | "CUSTOM";

interface TestItem {
  id: string;
  type: TestType;
  topic: { name: string };
  _count: { questions: number };
}

const TYPE_CONFIG: Record<TestType, { label: string; icon: React.ReactNode; color: string }> = {
  BASIC: { label: "Tests Básicos", icon: <BookOpen size={16} />, color: "yellow" },
  ERROR: { label: "Tests de Errores", icon: <AlertTriangle size={16} />, color: "red" },
  CUSTOM: { label: "Tests Personalizados", icon: <Sparkles size={16} />, color: "purple" },
};

export default function StudentTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<TestType[]>(["BASIC", "ERROR", "CUSTOM"]);

  const fetchTests = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTypes.length < 3 && selectedTypes.length > 0) {
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
      const res = await fetch("/api/student/error-tests/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchTests();
      } else {
        alert(data.message || "Error al generar tests");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setRefreshing(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTests]);

  const toggleType = (type: TestType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getTypeIcon = (type: TestType) => {
    switch (type) {
      case "ERROR":
        return <AlertTriangle size={28} className="text-red-500" />;
      case "CUSTOM":
        return <Sparkles size={28} className="text-purple-500" />;
      default:
        return <BookOpen size={28} />;
    }
  };

  const getTypeStyles = (type: TestType) => {
    switch (type) {
      case "ERROR":
        return {
          icon: "bg-red-50 text-red-600",
          badge: "bg-red-50 text-red-500 border-red-100",
          button: "bg-red-500 hover:bg-red-600 shadow-red-100",
        };
      case "CUSTOM":
        return {
          icon: "bg-purple-50 text-purple-600",
          badge: "bg-purple-50 text-purple-500 border-purple-100",
          button: "bg-purple-500 hover:bg-purple-600 shadow-purple-100",
        };
      default:
        return {
          icon: "bg-yellow-50 text-yellow-600",
          badge: "bg-gray-50 text-gray-400 border-gray-100",
          button: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-100",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#fafafa]">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#fafafa]">
      <main className="p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Tests Disponibles 🚗
          </h1>
          <p className="text-gray-500 font-medium">
            Selecciona una categoría y demuestra lo que sabes.
          </p>
        </header>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition shadow-sm font-medium text-gray-800 placeholder:text-gray-400"
            />
          </div>

          
          <button
            onClick={regenerateErrorTests}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 hover:bg-red-100 transition shadow-sm cursor-pointer active:scale-95"
            title="Refrescar tests de errores"
          >
            <RefreshCw size={24} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 bg-white border rounded-2xl transition shadow-sm cursor-pointer ${
                showFilters ? "border-yellow-500 text-yellow-600" : "border-gray-100 text-gray-400 hover:text-yellow-600"
              }`}
            >
              <Filter size={24} />
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Tipos de Test
                </p>
                {(Object.keys(TYPE_CONFIG) as TestType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                        selectedTypes.includes(type)
                          ? `bg-${TYPE_CONFIG[type].color}-500 border-${TYPE_CONFIG[type].color}-500`
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundColor: selectedTypes.includes(type)
                          ? type === "BASIC" ? "#eab308" : type === "ERROR" ? "#ef4444" : "#a855f7"
                          : "transparent",
                        borderColor: selectedTypes.includes(type)
                          ? type === "BASIC" ? "#eab308" : type === "ERROR" ? "#ef4444" : "#a855f7"
                          : "#d1d5db",
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
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
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
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 ${styles.icon} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300`}>
                      {getTypeIcon(test.type)}
                    </div>
                    <span className={`${styles.badge} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border`}>
                      {test._count.questions} Preguntas
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                    {test.topic.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2">
                    {test.type === "ERROR"
                      ? "Repasa las preguntas que has fallado anteriormente."
                      : test.type === "CUSTOM"
                      ? "Test personalizado generado por IA según tu progreso."
                      : "Domina este bloque de contenido practicando con preguntas reales de examen."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
                      <Clock size={14} className="text-yellow-500" />
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
