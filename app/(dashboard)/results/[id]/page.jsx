"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { DashboardCard } from "@/components/dashboard-card";
import { mockResultDetails } from "@/lib/mock-data";
import { use, useState } from "react";
import {
  Printer,
  Download,
  CheckCircle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  FileText,
  BarChart3,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Status Badge - የተሻሻለ ቀለሞች
function StatusBadge({ status }) {
  const statusStyles = {
    NORMAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
    LOW: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const StatusIcon = status === "HIGH" ? ArrowUp : status === "LOW" ? ArrowDown : null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
      statusStyles[status] || statusStyles.NORMAL
    )}>
      {status}
      {StatusIcon && <StatusIcon className="h-3 w-3" />}
    </span>
  );
}

export default function ResultDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const result = mockResultDetails; // ወደፊት እዚህ ጋር fetch(api/results/${id}) ይደረጋል

  const handlePrint = () => window.print();

  return (
    <div className="w-full bg-slate-50/50 min-h-screen pb-12 print:bg-white print:pb-0">
      <Header title={`Report Detail #${id}`} />

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Breadcrumb - ለሞባይል ምቹ እንዲሆን */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/dashboard" className="hover:text-[#004a7c]">Dashboard</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/results" className="hover:text-[#004a7c]">Lab Results</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#004a7c]">Report #{id}</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#004a7c]">
               <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                {result.patientName}
                {result.isVerified && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Report ID: <span className="font-bold">#{id}</span> • Collected on {result.dateOfCollection}</p>
            </div>
          </div>
          
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="gap-2 text-slate-600 border-slate-200">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button className="gap-2 bg-[#004a7c] hover:bg-[#003a63]">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Sidebar */}
          <div className="space-y-6">
            <DashboardCard className="bg-white border-none shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Patient & Doctor Info</h3>
               <div className="space-y-5">
                  <InfoItem icon={<UserIcon className="h-4 w-4" />} label="Physician" value={result.referringPhysician} />
                  <InfoItem icon={<FileText className="h-4 w-4" />} label="Panel ID" value={`#${result.panelId}`} />
                  <div className="pt-4 border-t border-slate-50">
                     <p className="text-[10px] text-slate-400 font-black uppercase mb-3">Status</p>
                     <StatusBadge status="NORMAL" />
                  </div>
               </div>
            </DashboardCard>

            <DashboardCard className="bg-[#004a7c] text-white border-none">
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Next Step</p>
               <p className="font-bold text-sm mb-4">{result.nextAction.title}</p>
               <Button className="w-full bg-white text-[#004a7c] hover:bg-blue-50 font-black shadow-lg">
                 {result.nextAction.buttonText}
               </Button>
            </DashboardCard>
          </div>

          {/* Results Table */}
          <DashboardCard className="lg:col-span-2 bg-white border-none shadow-sm p-0 overflow-hidden">
             <div className="p-6 border-b border-slate-50">
                <h3 className="font-black text-slate-800">Laboratory Findings</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="py-4 px-6">Parameter</th>
                         <th className="py-4 px-6 text-center">Result</th>
                         <th className="py-4 px-6 text-right">Reference Range</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {result.lipidProfile.map((test, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 px-6">
                              <p className="font-bold text-slate-700 text-sm">{test.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase">{test.method}</p>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className={cn("text-base font-black", test.status === "HIGH" ? "text-red-500" : "text-[#004a7c]")}>
                                {test.result}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1 font-bold">{test.unit}</span>
                           </td>
                           <td className="py-4 px-6 text-right font-bold text-slate-500 text-xs">
                              {test.referenceRange}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

// Helper component
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004a7c]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{label}</p>
        <p className="font-bold text-slate-700 text-sm">{value}</p>
      </div>
    </div>
  );
}