"use client";
import { useState, useEffect } from "react";
import { Brain, Beaker, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DoctorDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctor/pending")
      .then(res => res.json())
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Doctor's Portal</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Pending Lab Reviews</p>
        </header>

        <div className="grid gap-4">
          {results.length === 0 ? (
            <div className="bg-white p-20 rounded-[40px] text-center border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase text-sm">No pending results to review.</p>
            </div>
          ) : (
            results.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Beaker size={24} /></div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">{item.testType}</h3>
                    <p className="text-xs text-slate-400 font-bold">Patient: {item.patient.name} (MRN: {item.patient.mrn})</p>
                  </div>
                </div>
                <Link href={`/doctor/review/${item.id}`}>
                  <Button className="bg-[#004a7c] hover:bg-[#00365c] rounded-xl font-bold text-xs uppercase gap-2">
                    Review with AI <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}