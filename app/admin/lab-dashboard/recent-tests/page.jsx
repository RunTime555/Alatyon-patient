"use client";
import { useState, useEffect } from "react"; // useEffect ተጨምሯል
import Link from "next/link";
import { ArrowLeft, Search, Filter, FileText, CheckCircle2, Clock, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecentTestsPage() {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ዳታውን ከዳታቤዝ የመጥራት ሂደት
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/lab/results');
        const data = await res.json();
        if (res.ok) {
          setTests(data);
        }
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  // ሰርች ለማድረግ (በ MRN ወይም በስም)
  const filteredTests = tests.filter(test => 
    test.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/lab-dashboard">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all active:scale-90">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Recent Lab Tests</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Laboratory Archive & History</p>
            </div>
          </div>
          <Button className="h-12 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold flex gap-2 shadow-lg">
            <Printer size={18} /> Export Report
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-500" size={20} />
            <Input 
              className="pl-12 h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium" 
              placeholder="Search by MRN or Test Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold flex gap-2 text-slate-600">
            <Filter size={18} /> Filter
          </Button>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Records...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Patient ID</th>
                  <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Test Category</th>
                  <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Value</th>
                  <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Date</th>
                  <th className="p-6 font-bold text-[10px] uppercase tracking-widest text-center">Status</th>
                  <th className="p-6 font-bold text-[10px] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTests.map((test, index) => (
                  <tr key={test.id || index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6 font-black text-cyan-600">{test.patientId}</td>
                    <td className="p-6">
                      <span className="flex items-center gap-2 text-slate-800 font-bold">
                        <FileText className="h-4 w-4 text-slate-300" /> {test.testName}
                      </span>
                    </td>
                    <td className="p-6 font-medium text-slate-600">{test.resultValue}</td>
                    <td className="p-6 text-sm font-bold text-slate-400">
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" /> SENT
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase text-slate-400 hover:text-cyan-600">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!isLoading && filteredTests.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs">
               No matching records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}