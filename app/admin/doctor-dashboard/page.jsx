"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, Beaker, 
  Stethoscope, Loader2, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DoctorDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); 
  const [doctorNotes, setDoctorNotes] = useState({}); 

  // 1. መረጃዎችን ከ API መጥራት
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/doctor/pending");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        toast.error("ውጤቶችን መጫን አልተቻለም");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  // 2. Approve ወይም Reject የማድረጊያ ፋንክሽን
  const handleDecision = async (resultId, decision) => {
    setProcessingId(resultId);
    try {
      const response = await fetch("/api/doctor/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId,
          action: decision, // "APPROVE" ወይም "REJECT"
          doctorNote: doctorNotes[resultId] || ""
        }),
      });

      if (response.ok) {
        const msg = decision === "APPROVE" ? "ውጤቱ ጸድቆ ለታካሚው ተልኳል" : "ውጤቱ ውድቅ ተደርጓል";
        toast.success(msg);
        
        // ⚠️ ውጤቱ ስለተሰራ ከዶክተሩ ዝርዝር ውስጥ ማስወገድ
        setResults(prev => prev.filter(item => item.id !== resultId));
      } else {
        throw new Error("Failed to process");
      }
    } catch (err) {
      toast.error("ሂደቱ አልተሳካም፣ እባክዎ እንደገና ይሞክሩ");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
       <Loader2 className="h-10 w-10 animate-spin text-[#004a7c] mb-4" />
       <p className="text-slate-500 font-bold animate-pulse">Loading Pending Results...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-10 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Doctor Approval Portal</h1>
          <p className="text-slate-500">በአላቲዮን ሆስፒታል ለግምገማ የተላኩ የላብራቶሪ ውጤቶች</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{results.length}</p>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">To Review</p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="grid gap-6">
        {results.length > 0 ? (
          results.map((result) => (
            <div key={result.id} className="group bg-white rounded-[35px] p-6 md:p-8 shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col lg:flex-row gap-8">
              
              {/* Patient Profile */}
              <div className="lg:w-1/4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-900 to-[#004a7c] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                    {result.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 leading-none mb-1">{result.patient.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400">MRN: {result.patient.mrn}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Beaker size={14} />
                    <span className="text-xs font-black uppercase tracking-tighter">{result.testName}</span>
                  </div>
                  <p className="text-xl font-black text-[#004a7c]">{result.testValue} <span className="text-xs text-slate-400">{result.unit}</span></p>
                </div>
              </div>

              {/* Note Input */}
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Clinical Remarks (Optional)</label>
                <textarea 
                  className="w-full h-full min-h-[100px] p-4 rounded-[24px] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium transition-all"
                  placeholder="ታካሚው እንዲያውቀው የሚፈልጉትን የህክምና ምክር እዚህ ይጻፉ..."
                  value={doctorNotes[result.id] || ""}
                  onChange={(e) => setDoctorNotes({...doctorNotes, [result.id]: e.target.value})}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col justify-center gap-4">
                <Button 
                  disabled={processingId === result.id}
                  onClick={() => handleDecision(result.id, "APPROVE")}
                  className="flex-1 lg:h-20 lg:w-20 rounded-[24px] bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 border-none transition-transform active:scale-90"
                >
                  {processingId === result.id ? <Loader2 className="animate-spin" /> : <CheckCircle size={32} />}
                </Button>
                <Button 
                  disabled={processingId === result.id}
                  variant="outline"
                  onClick={() => handleDecision(result.id, "REJECT")}
                  className="flex-1 lg:h-20 lg:w-20 rounded-[24px] border-slate-100 text-red-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  <XCircle size={32} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border-4 border-dashed border-slate-50">
            <Stethoscope size={64} className="mx-auto mb-6 text-slate-100" />
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-[0.2em]">All Caught Up!</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">በአሁኑ ሰዓት የሚገመገም የላብራቶሪ ውጤት የለም።</p>
          </div>
        )}
      </div>
    </div>
  );
}