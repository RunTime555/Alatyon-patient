"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Loader2, Plus, Trash2, Beaker, 
  Activity, Search, Menu, X, PlusCircle, User2, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function LabUploadPage() {
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientMrn, setPatientMrn] = useState("");
  const [recentResults, setRecentResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [tests, setTests] = useState([
    { id: Date.now(), testName: "", customTestName: "", isOther: false, resultValue: "" }
  ]);

  const testTypes = [
    "Complete Blood Count (CBC)", "Blood Glucose", "Lipid Profile",
    "Liver Function (LFT)", "Renal Function (RFT)", "Urinalysis",
    "Thyroid Function (TSH)", "Malaria Parasite (MP)", "H. Pylori", "Other"
  ];

  const fetchRecentResults = async () => {
    try {
      const res = await fetch("/api/lab/recent");
      const json = await res.json();
      if (json.success) setRecentResults(json.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRecentResults(); }, []);

  const groupedResults = useMemo(() => {
    const groups = {};
    recentResults.forEach((result) => {
      const mrn = result.patient?.mrn || "N/A";
      if (!groups[mrn]) {
        groups[mrn] = { name: result.patient?.name || "Unknown", mrn, tests: [] };
      }
      groups[mrn].tests.push(result);
    });
    return Object.values(groups).filter(g => 
      g.mrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentResults, searchQuery]);

  const addTestField = () => {
    setTests([...tests, { id: Date.now(), testName: "", customTestName: "", isOther: false, resultValue: "" }]);
  };

  const removeTestField = (id) => {
    if (tests.length > 1) setTests(tests.filter(t => t.id !== id));
  };

  const updateTest = (id, field, value) => {
    setTests(tests.map(t => {
      if (t.id === id) {
        if (field === "testName") {
          return { ...t, testName: value, isOther: value === "Other" };
        }
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // "Other" ከተመረጠ የጻፈውን ስም እንወስዳለን
    const finalResults = tests.map(t => ({
      testName: t.isOther ? t.customTestName : t.testName,
      resultValue: t.resultValue
    }));

    try {
      const res = await fetch("/api/lab/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientMrn, results: finalResults }),
      });

      if (res.ok) {
        setPatientMrn("");
        setTests([{ id: Date.now(), testName: "", customTestName: "", isOther: false, resultValue: "" }]);
        await fetchRecentResults();
        alert("Success!");
      }
    } catch (error) {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 transform 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Activity size={18}/></div>
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Recent Submissions</h2>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              placeholder="Search MRN..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {groupedResults.map((group) => (
              <div key={group.mrn} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-[10px]">
                    {group.name.substring(0,1)}
                  </div>
                  <h4 className="font-bold text-slate-800 text-[11px] truncate">{group.name}</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.tests.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-white text-[9px] font-medium py-0 px-1">
                      {t.testName}: {t.testValue}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 md:ml-72 min-h-screen">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
           <div className="flex items-center gap-2 font-bold text-blue-900 font-sans"><Beaker size={18}/> Lab Portal</div>
           <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></Button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <header className="mb-10 hidden md:block">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <span className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200"><Beaker size={24}/></span>
              Laboratory Results Entry
            </h1>
            <p className="text-slate-500 mt-2 ml-16 text-sm font-medium italic">Please ensure MRN accuracy before submission.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm ring-1 ring-slate-100">
              <Label className="text-[11px] font-black uppercase text-slate-400 mb-3 block">Patient Identification</Label>
              <div className="relative group">
                <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <Input 
                  placeholder="Enter Patient MRN..." 
                  className="pl-12 h-16 rounded-2xl bg-slate-50 border-none font-bold text-lg"
                  value={patientMrn}
                  onChange={(e) => setPatientMrn(e.target.value)}
                  required 
                />
              </div>
            </section>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={test.id} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm relative animate-in fade-in zoom-in duration-300">
                  <div className="grid grid-cols-1 gap-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500">TEST CATEGORY</Label>
                        <Select onValueChange={(v) => updateTest(test.id, "testName", v)}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700">
                            <SelectValue placeholder="Choose Test Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {testTypes.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500">RESULT VALUE</Label>
                        <div className="flex gap-3">
                          <Input 
                            placeholder="0.00" 
                            className="h-14 rounded-2xl bg-slate-50 border-none font-black text-blue-700 text-lg"
                            onChange={(e) => updateTest(test.id, "resultValue", e.target.value)}
                            required
                          />
                          {tests.length > 1 && (
                            <Button type="button" onClick={() => removeTestField(test.id)} variant="ghost" className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={20}/>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* "Other" ሲመረጥ የሚመጣ ተጨማሪ Input */}
                    {test.isOther && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-[10px] font-black text-blue-600 mb-2 block uppercase tracking-wider">Please specify the test name</Label>
                        <div className="flex gap-2 items-center bg-blue-50 p-2 rounded-2xl border border-blue-100 ring-4 ring-blue-50/50">
                          <AlertCircle size={18} className="text-blue-500 ml-2" />
                          <Input 
                            placeholder="Type the custom test name here..." 
                            className="bg-transparent border-none focus-visible:ring-0 font-bold text-slate-700"
                            onChange={(e) => updateTest(test.id, "customTestName", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                onClick={addTestField} 
                variant="ghost" 
                className="w-full border-2 border-dashed border-slate-200 rounded-3xl h-16 font-bold text-slate-400 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all"
              >
                <PlusCircle size={20} className="mr-2" /> Add Another Test Record
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-20 bg-[#004a7c] hover:bg-black text-white rounded-[32px] font-black uppercase text-sm tracking-[2px] shadow-xl transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Confirm & Sync Results"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}