"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Beaker, PlusCircle, ClipboardList, LogOut, Loader2, CheckCircle2, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LabDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // የፎርም ዳታ ስቴት
  const [formData, setFormData] = useState({
    patientId: "",
    testName: "",
    resultValue: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ማስታወሻ፡ እዚህ ጋር የ API endpoint ስምሽ እንደ አወቃቀርሽ ሊለያይ ይችላል
      const res = await fetch('/api/lab/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ patientId: "", testName: "", resultValue: "" }); // ፎርሙን ባዶ ማድረግ
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "መረጃውን መመዝገብ አልተቻለም");
      }
    } catch (err) {
      setError("ከዳታቤዝ ጋር መገናኘት አልተቻለም");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // እዚህ ጋር ኩኪዎችን ወይም ሴሽን ማጥፋት ይቻላል
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar - Clean & Professional */}
      <div className="w-72 bg-[#0f172a] text-white p-8 flex flex-col shadow-2xl hidden md:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Beaker className="text-white h-6 w-6" />
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-cyan-400">Alatyon Lab</h2>
        </div>
        
        <nav className="space-y-3 flex-1">
          <div className="flex items-center gap-3 p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
            <PlusCircle size={20} /> 
            <span className="font-bold text-sm uppercase tracking-wider">Add Result</span>
          </div>
          
          <button onClick={() => router.push('/admin/lab-dashboard/recent-tests')} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white group">
            <ClipboardList size={20} className="group-hover:scale-110 transition-transform" /> 
            <span className="font-bold text-sm uppercase tracking-wider">Recent Tests</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* New Header with Logout on the Right */}
        <header className="h-24 bg-white border-b border-slate-100 px-12 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Lab Portal</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Medical Analysis Department</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="text-right">
                    <p className="text-xs font-black text-slate-800">Lab Technician</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Online Now</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User size={20} />
                </div>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="h-12 px-5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl font-bold flex gap-2 transition-all group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="uppercase text-[11px] tracking-widest">Logout</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Form Area */}
        <div className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              {/* Success Overlay */}
              {submitted && (
                <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Result Saved!</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Forwarded to Doctor</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <PlusCircle size={18} className="text-cyan-600" />
                    </div>
                    New Test Entry
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg">{error}</p>}
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Patient Identifier (MRN)</Label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-cyan-500 transition-colors" />
                    <Input 
                        placeholder="Enter MRN (e.g. AL-001)" 
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all font-bold" 
                        required 
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Test Category</Label>
                    <Input 
                        placeholder="e.g. Hematology" 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold" 
                        required 
                        value={formData.testName}
                        onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Quantitative Result</Label>
                    <Input 
                        placeholder="e.g. 14.5 g/dL" 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold" 
                        required 
                        value={formData.resultValue}
                        onChange={(e) => setFormData({...formData, resultValue: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-16 bg-cyan-600 hover:bg-cyan-700 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all active:scale-95 flex gap-3" 
                    disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Commit Result to System"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}