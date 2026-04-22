"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TestRunner from "@/components/driving-tests/TestRunner";
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
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        {test && <TestRunner test={test} />}
      </div>
    </div>
  );
}
