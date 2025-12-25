"use client";

import { useEffect, useState, useCallback } from "react";
import RequestRow from "@/components/admin/RequestRow";
import ActionModal from "@/components/ui/ActionModal";
import { UserCheck } from "lucide-react";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    requestId: number | null;
    status: "APPROVED" | "REJECTED" | null;
  }>({ isOpen: false, requestId: null, status: null });

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling every 30 seconds
  useEffect(() => {
    fetchRequests();

    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRequests]);

  const openModal = (requestId: number, status: "APPROVED" | "REJECTED") => {
    setModalConfig({ isOpen: true, requestId, status });
  };

  const handleConfirmAction = async (adminNotes: string) => {
    const { requestId, status } = modalConfig;

    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status, adminNotes }),
    });

    if (res.ok) {
      setRequests((prev) => prev.filter((r: any) => r.id !== requestId));
      setModalConfig({ isOpen: false, requestId: null, status: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-700 p-2 rounded-lg text-white">
          <UserCheck size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes</h2>
      </div>

      <div className="animate-in fade-in duration-500">
        {requests.map((req: any) => (
          <RequestRow key={req.id} request={req} onAction={openModal} />
        ))}
      </div>

      <ActionModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={
          modalConfig.status === "APPROVED"
            ? "Aprobar Solicitud"
            : "Rechazar Solicitud"
        }
        confirmText={
          modalConfig.status === "APPROVED"
            ? "Confirmar Acceso"
            : "Confirmar Rechazo"
        }
        variant={modalConfig.status as any}
      />
    </div>
  );
}
