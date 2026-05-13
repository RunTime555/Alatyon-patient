"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardCard, MetricCard } from "@/components/dashboard-card";
import {
  Heart,
  Calendar,
  ClipboardList,
  Download,
  Droplet,
  TestTube,
  Activity,
  User,
  BrainCircuit,
  Loader2,
  Stethoscope // አዲስ የተጨመረ
} from "lucide-react";
import { Button } from "@/components/ui/button";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function ResultIcon({ type }) {
  const lowerName = type?.toLowerCase() || "";
  if (lowerName.includes("blood")) return <Droplet className="h-5 w-5 text-red-500" />;
  if (lowerName.includes("glucose") || lowerName.includes("sugar")) return <Activity className="h-5 w-5 text-orange-500" />;
  return <TestTube className="h-5 w-5 text-blue-500" />;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", mrn: "", results: [] });
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const result = await res.json();
          setData(result);
          // የመጀመሪያውን ውጤት ሰሌክት እንዲያደርግ (Optional)
          if (result.results.length > 0) setSelectedResult(result.results[0]);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  // ዳታውን ለመከፋፈል የሚረዳ ፋንክሽን
  const getParsedInterpretation = (text) => {
    if (!text) return { doctor: null, ai: null };
    const parts = text.split('---');
    return {
      doctor: parts[0]?.replace("DOCTOR'S NOTE:", "").trim(),
      ai: parts[1]?.replace("AI INSIGHT:", "").trim()
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/50 min-h-screen flex flex-col">
      <main className="p-6 space-y-8 max-w-7xl mx-auto flex-1 w-full">
        
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
              {getGreeting()}, {data.name}! 
            </h1>
            <p className="text-lg text-[#004a7c] font-medium opacity-90">
              Your Medical ID: <span className="font-mono bg-blue-100 px-2 py-1 rounded">{data.mrn}</span>
            </p>
          </div>

          <DashboardCard className="flex items-center gap-4 bg-white border-none shadow-sm py-4 px-6">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100 animate-pulse">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Health Status</p>
              <p className="text-xl font-black text-slate-700">Active</p>
            </div>
          </DashboardCard>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Total Tests" value={data.results.length} icon={<ClipboardList />} />
          <MetricCard label="Verified" value={data.results.filter(r => r.status === "Verified").length} icon={<CheckCircle2 className="text-emerald-500" size={20}/>} />
          <MetricCard label="Latest Visit" value={data.results[0] ? new Date(data.results[0].createdAt).toLocaleDateString() : "N/A"} icon={<Calendar />} variant="highlight" />
          <MetricCard label="Patient ID" value={data.mrn} icon={<User />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Result History */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Result History</h2>
            <div className="grid gap-3">
              {data.results.map((result) => (
                <div key={result.id} onClick={() => setSelectedResult(result)} className="cursor-pointer">
                  <DashboardCard className={`group transition-all p-5 bg-white ${selectedResult?.id === result.id ? 'border-blue-500 ring-2 ring-blue-50' : 'hover:shadow-md border-none'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ResultIcon type={result.testName} />
                        <div>
                          <p className="font-bold text-slate-700 group-hover:text-[#004a7c]">{result.testName}</p>
                          <p className="text-xs text-slate-400 font-medium">{new Date(result.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`text-[10px] font-black px-3 py-1 rounded-full border-none ${result.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {result.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-blue-600">
                          <Download size={18}/>
                        </Button>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              ))}
            </div>
          </div>

          {/* AI & Doctor Insight Panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Clinical Insight</h2>
            <div className="bg-white p-6 rounded-[32px] border border-blue-50 shadow-xl shadow-blue-900/5 sticky top-6 space-y-6">
              
              {selectedResult ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Result Value */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Measured Value</p>
                    <p className="text-3xl font-black text-[#004a7c]">{selectedResult.testValue} <span className="text-sm font-bold text-slate-400">{selectedResult.unit}</span></p>
                  </div>

                  {selectedResult.status === "Verified" ? (
                    <div className="space-y-5">
                      {/* Doctor's Part */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Stethoscope size={16} className="text-[#004a7c]" />
                          <span className="text-xs font-black uppercase tracking-wider">Doctor's Remark</span>
                        </div>
                        <div className="p-4 bg-white border-l-4 border-[#004a7c] rounded-r-xl shadow-sm italic text-sm text-slate-600">
                          {getParsedInterpretation(selectedResult.interpretation).doctor || "No specific note from the doctor."}
                        </div>
                      </div>

                      {/* AI Part */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600">
                          <BrainCircuit size={16} />
                          <span className="text-xs font-black uppercase tracking-wider">Gemini AI Analysis</span>
                        </div>
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm text-slate-700 leading-relaxed font-medium">
                          {getParsedInterpretation(selectedResult.interpretation).ai || "AI analysis is unavailable for this record."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-3">
                      <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="text-amber-500 animate-spin-slow" size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Pending Doctor's Review</p>
                      <p className="text-xs text-slate-400 px-4">Insights will be available once the doctor verifies the results.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-300">
                  <Activity className="mx-auto mb-4 opacity-20" size={48} />
                  <p className="text-sm font-bold uppercase tracking-widest">Select a result</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ትናንሽ ኮምፖነንቶች እዚህ ጋር ካልተጫኑ
function CheckCircle2(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  )
}

function Badge({ children, className }) {
  return <span className={`inline-flex items-center ${className}`}>{children}</span>;
}

function Clock(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}