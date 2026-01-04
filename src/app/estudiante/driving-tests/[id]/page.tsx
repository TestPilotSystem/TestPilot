"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TestRunner from "@/components/driving-tests/TestRunner";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Loader2 } from "lucide-react";

export default function TestExecutionPage() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/driving-tests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTest(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#fafafa]">
      <DashboardHeader />
      <main className="p-8">{test && <TestRunner test={test} />}</main>
    </div>
  );
}
