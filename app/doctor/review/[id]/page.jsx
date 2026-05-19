"use client";
import { useState, useEffect } from "react";
import { Brain, CheckCircle, Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function ReviewPage({ params }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [aiText, setAiText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/lab/result/${params.id}`).then(res => res.json()).then(setData);
  }, [params.id]);

  const runAI = async () => {
    setIsAnalyzing(true);
    const res = await fetch(`/api/doctor/analyze/${params.id}`);
    const json = await res.json();
    setAiText(json.analysis);
    setIsAnalyzing(false);
  };

  const approveResult = async () => {
    setIsSaving(true);
    await fetch(`/api/doctor/approve/${params.id}`, {
      method: "POST",
      body: JSON.stringify({ finalComment: aiText })
    });
    router.push("/doctor");
  };

  if (!data) return <p className="p-20 text-center font-bold text-slate-400">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2 text-slate-500 font-black text-[10px] uppercase"><ArrowLeft size={14} /> Back</Button>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm h-fit">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Patient Details</h4>
            <p className="text-lg font-black text-slate-800">{data.patient.name}</p>
            <p className="text-blue-600 font-bold text-xs italic">MRN: {data.patient.mrn}</p>
            <hr className="my-6 border-slate-50" />
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Test Data</h4>
            <p className="text-sm font-bold text-slate-600">{data.testType}</p>
            <p className="text-3xl font-black text-[#004a7c] mt-1">{data.value}</p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 uppercase text-xs flex items-center gap-2"><Brain className="text-blue-600" /> AI Diagnostic Summary</h3>
                <Button onClick={runAI} disabled={isAnalyzing} size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-black text-[10px] uppercase">
                  {isAnalyzing ? <Loader2 className="animate-spin h-3 w-3" /> : "Generate Analysis"}
                </Button>
              </div>

              {aiText && (
                <div className="space-y-6 animate-in fade-in duration-700">
                  <Textarea 
                    value={aiText} 
                    onChange={(e) => setAiText(e.target.value)}
                    className="min-h-[250px] rounded-2xl bg-slate-50 border-none p-4 font-medium leading-relaxed"
                  />
                  <Button onClick={approveResult} disabled={isSaving} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black uppercase text-xs tracking-widest">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} className="mr-2" /> Approve & Send to Patient</>}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}