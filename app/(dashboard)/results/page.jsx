"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Download, Search, Filter, ChevronDown,
  TestTube, Droplet, Activity, CheckCircle2, Clock,
  AlertCircle, FlaskConical, FileText, X, Eye,
  TrendingUp, Calendar, Beaker
} from "lucide-react";

// ── Status config ──────────────────────────────────────────
const STATUS = {
  Verified:       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Approved",  icon: CheckCircle2 },
  COMPLETED:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Approved",  icon: CheckCircle2 },
  PENDING_DOCTOR: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",  label: "Pending",   icon: Clock },
  REJECTED:       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",    label: "Rejected",  icon: AlertCircle },
};
const getStatus = (s) => STATUS[s] ?? { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", label: s ?? "Unknown", icon: Clock };

function ResultIcon({ type }) {
  const t = type?.toLowerCase() ?? "";
  if (t.includes("blood") || t.includes("cbc")) return <Droplet size={15} className="text-red-500" />;
  if (t.includes("glucose") || t.includes("sugar")) return <Activity size={15} className="text-orange-500" />;
  if (t.includes("urine") || t.includes("urinalysis")) return <FlaskConical size={15} className="text-yellow-500" />;
  return <TestTube size={15} className="text-blue-500" />;
}

// ── PDF / print download ───────────────────────────────────
function downloadResult(result, patientName, mrn) {
  const content = `
ALATYON HOSPITAL — LAB RESULT REPORT
======================================
Patient Name : ${patientName}
Medical ID   : ${mrn}
Date         : ${new Date(result.createdAt).toLocaleDateString()}
======================================

TEST DETAILS
------------
Test Name    : ${result.testName}
Result Value : ${result.testValue ?? result.resultValue ?? "—"} ${result.unit ?? ""}
Status       : ${getStatus(result.status).label}

DOCTOR'S REMARK
---------------
${result.doctorComment || parseSections(result.interpretation).doctor || "No remark provided."}

AI ANALYSIS
-----------
${parseSections(result.interpretation).ai || "Not available."}

======================================
Generated on ${new Date().toLocaleString()}
Alatyon Hospital — All rights reserved.
  `.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${result.testName.replace(/\s+/g, "_")}_${mrn}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseSections(text) {
  if (!text) return { doctor: null, ai: null };
  const parts = text.split("---");
  return {
    doctor: parts[0]?.replace(/DOCTOR['']?S?\s*NOTE:?/i, "").trim() || null,
    ai:     parts[1]?.replace(/AI\s*(INSIGHT|ANALYSIS):?/i, "").trim() || null,
  };
}

// ── Detail modal ───────────────────────────────────────────
function ResultModal({ result, patientName, mrn, onClose }) {
  if (!result) return null;
  const st      = getStatus(result.status);
  const Icon    = st.icon;
  const parsed  = parseSections(result.interpretation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ResultIcon type={result.testName} />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{result.testName}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {new Date(result.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
              <Icon size={10} />{st.label}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Value */}
          <div className="bg-[#f0f6ff] rounded-2xl p-5 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Measured Value</p>
            <p className="text-4xl font-black text-[#003a66]">
              {result.testValue ?? result.resultValue ?? "—"}
              {result.unit && <span className="text-lg font-bold text-slate-400 ml-2">{result.unit}</span>}
            </p>
          </div>

          {/* Patient info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Patient</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{patientName}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">MRN</p>
              <p className="text-sm font-bold font-mono text-slate-700 mt-0.5">{mrn}</p>
            </div>
          </div>

          {/* Doctor remark */}
          {(parsed.doctor || result.doctorComment) && (
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-4 h-4 bg-[#003a66] rounded-md flex items-center justify-center">
                  <FileText size={9} className="text-white" />
                </span>
                Doctor's Remark
              </p>
              <div className="p-4 bg-white border-l-4 border-[#003a66] rounded-r-xl text-sm text-slate-600 italic leading-relaxed">
                {parsed.doctor || result.doctorComment}
              </div>
            </div>
          )}

          {/* AI analysis */}
          {parsed.ai && (
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-4 h-4 bg-blue-600 rounded-md flex items-center justify-center">
                  <TrendingUp size={9} className="text-white" />
                </span>
                AI Analysis
              </p>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-slate-700 leading-relaxed">
                {parsed.ai}
              </div>
            </div>
          )}

          {/* Download */}
          <button
            onClick={() => downloadResult(result, patientName, mrn)}
            className="w-full flex items-center justify-center gap-2 bg-[#003a66] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20"
          >
            <Download size={15} /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function LabResultsPage() {
  const router = useRouter();
  const [data, setData]           = useState({ name: "", mrn: "", results: [] });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [sortDir, setSortDir]     = useState("desc"); // newest first

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => { if (!r.ok) { router.push("/login"); return null; } return r.json(); })
      .then(d => { if (d) setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const counts = useMemo(() => ({
    all:      data.results.length,
    approved: data.results.filter(r => ["Verified","COMPLETED"].includes(r.status)).length,
    pending:  data.results.filter(r => r.status === "PENDING_DOCTOR").length,
    rejected: data.results.filter(r => r.status === "REJECTED").length,
  }), [data.results]);

  const filtered = useMemo(() => {
    return data.results
      .filter(r => {
        const matchSearch =
          !search ||
          r.testName?.toLowerCase().includes(search.toLowerCase()) ||
          r.testValue?.toString().includes(search);
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "approved" && ["Verified","COMPLETED"].includes(r.status)) ||
          (statusFilter === "pending"  && r.status === "PENDING_DOCTOR") ||
          (statusFilter === "rejected" && r.status === "REJECTED");
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const da = new Date(a.createdAt), db = new Date(b.createdAt);
        return sortDir === "desc" ? db - da : da - db;
      });
  }, [data.results, search, statusFilter, sortDir]);

  const downloadAll = () => {
    const rows = [
      ["Test Name", "Value", "Unit", "Status", "Date"],
      ...filtered.map(r => [
        r.testName,
        r.testValue ?? r.resultValue ?? "—",
        r.unit ?? "",
        getStatus(r.status).label,
        new Date(r.createdAt).toLocaleDateString(),
      ])
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${data.mrn}_all_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-5 pb-10">

      {/* Modal */}
      {selected && (
        <ResultModal
          result={selected}
          patientName={data.name}
          mrn={data.mrn}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800">Lab Results</h1>
          <p className="text-sm text-slate-400 mt-0.5">All your test records — {data.name} · MRN: {data.mrn}</p>
        </div>
        <button
          onClick={downloadAll}
          className="flex items-center gap-2 bg-[#003a66] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/20 w-fit"
        >
          <Download size={14} /> Export All CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: counts.all,      bg: "bg-blue-50",    text: "text-blue-700",    icon: Beaker },
          { label: "Approved", value: counts.approved,  bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
          { label: "Pending",  value: counts.pending,   bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock },
          { label: "Rejected", value: counts.rejected,  bg: "bg-red-50",     text: "text-red-700",     icon: AlertCircle },
        ].map(({ label, value, bg, text, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-blue-50 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={16} className={text} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-lg font-black text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by test name or value…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all
            ${showFilter ? "bg-[#003a66] text-white border-[#003a66]" : "bg-white text-slate-600 border-blue-100 hover:bg-[#f0f6ff]"}`}
        >
          <Filter size={13} /> Filter
          <ChevronDown size={12} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => setSortDir(v => v === "desc" ? "asc" : "desc")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-100 bg-white text-slate-600 text-xs font-bold hover:bg-[#f0f6ff] transition-all"
        >
          <Calendar size={13} />
          {sortDir === "desc" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {/* Filter chips */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 bg-white border border-blue-100 rounded-2xl p-4">
          {[
            { key: "all",      label: `All (${counts.all})` },
            { key: "approved", label: `Approved (${counts.approved})` },
            { key: "pending",  label: `Pending (${counts.pending})` },
            { key: "rejected", label: `Rejected (${counts.rejected})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${statusFilter === key ? "bg-[#003a66] text-white" : "bg-[#f0f6ff] text-slate-600 hover:bg-blue-100"}`}>
              {label}
            </button>
          ))}
        </div>
      )}

    {/* Table Section */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-50 bg-[#f7faff]">
                {["Test Name", "Result Value", "Unit", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <TestTube size={28} className="text-blue-100 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-sm">No results found.</p>
                  </td>
                </tr>
              ) : filtered.map((r) => {
                const st = getStatus(r.status);
                return (
                  <tr key={r.id} className="hover:bg-[#f7faff] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><ResultIcon type={r.testName} /></div>
                        <span className="font-bold text-slate-700 text-sm">{r.testName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="text-lg font-black text-[#003a66]">{r.testValue ?? r.resultValue ?? "—"}</span></td>
                    <td className="px-5 py-4"><span className="text-xs font-bold text-slate-400">{r.unit ?? "—"}</span></td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4"><span className="text-xs font-semibold text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(r)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600"><Eye size={14} /></button>
                        <button onClick={() => downloadResult(r, data.name, data.mrn)} className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600"><Download size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="sm:hidden divide-y divide-blue-50">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 flex items-center gap-3 hover:bg-[#f7faff]">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><ResultIcon type={r.testName} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-700 text-sm truncate">{r.testName}</p>
                <p className="text-xs text-slate-400 mt-0.5"><span className="font-bold text-[#003a66]">{r.testValue ?? r.resultValue ?? "—"}</span></p>
              </div>
              <button onClick={() => setSelected(r)} className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Eye size={12} /></button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-blue-50 bg-[#f7faff] flex items-center justify-between">
            <p className="text-xs text-slate-400 font-semibold">Showing {filtered.length} results</p>
            {(search || statusFilter !== "all") && (
              <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-xs text-blue-500 hover:text-blue-700 font-bold">Clear filters</button>
            )}
          </div>
        )}
      </div> 
    </div> // This closes the main space-y-5 container
  );
}