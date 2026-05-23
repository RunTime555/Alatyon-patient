"use client";
import { useState, useEffect } from "react";
import {
  Brain, Beaker, Loader2, LayoutDashboard, ClipboardList,
  Users, LogOut, Bell, Search, Menu, X, Clock3,
  ChevronRight, FlaskConical, FileText, Sparkles, TrendingUp,
  CheckCircle2, AlertCircle, ChevronDown
} from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/doctor" },
  { icon: ClipboardList,   label: "Pending Reviews", href: "/doctor/pending" },
  { icon: Users,           label: "Patients",        href: "/doctor/patients" },
  
];

const STATUS_COLORS = {
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", label: "Completed" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     label: "Rejected"  },
  critical:  { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     label: "Critical"  },
  elevated:  { bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-500",   label: "Elevated"  },
  normal:    { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", label: "Normal"    },
};

function Sidebar({ open, onClose, collapsed }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#003a66] flex flex-col transition-all duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:shrink-0
        ${collapsed ? "md:w-[68px]" : "md:w-60"} w-60`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0"><Beaker size={18} className="text-white" /></div>
          {!collapsed && <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-none">Alatyon</p>
            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Doctor Portal</p>
          </div>}
          <button onClick={onClose} className="md:hidden text-white/40 hover:text-white ml-auto shrink-0"><X size={17} /></button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
            <Link key={label} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${active ? "bg-blue-500 text-white shadow-lg shadow-blue-900/30" : "text-white/50 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-semibold">{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0">DR</div>
              <div className="flex-1 min-w-0"><p className="text-white text-xs font-bold truncate">Dr. User</p><p className="text-white/40 text-[10px]">Physician</p></div>
              <button className="text-white/30 hover:text-white"><LogOut size={14} /></button>
            </div>
          ) : (
            <div className="flex justify-center"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">DR</div></div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function AIReports() {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState(null);
  const [generating, setGenerating]   = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);

  useEffect(() => {
    // Fetch completed results that have AI analysis
    fetch("/api/doctor/pending")
      .then(r => r.json())
      .then(d => { setReports(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r =>
    !search ||
    r.testType?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.mrn?.toLowerCase().includes(search.toLowerCase())
  );

  const generateReport = async (id) => {
    setGenerating(id);
    try {
      const res  = await fetch(`/api/doctor/analyze/${id}`);
      const json = await res.json();
      setReports(prev => prev.map(r =>
        r.id === id ? { ...r, aiAnalysis: json.analysis } : r
      ));
      setExpanded(id);
    } finally {
      setGenerating(null);
    }
  };

  const stats = [
    { label: "Total Reports",   value: reports.length, icon: FileText,    color: "text-blue-600",    bg: "bg-blue-50"    },
    { label: "AI Generated",    value: reports.filter(r => r.interpretation || r.aiAnalysis).length, icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Completed",       value: reports.filter(r => r.status === "COMPLETED").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Critical",        value: reports.filter(r => r.status === "critical").length, icon: AlertCircle,  color: "text-red-600",     bg: "bg-red-50"     },
  ];

  return (
    <div className="flex h-screen bg-[#f0f6ff] font-sans overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        <header className="bg-white border-b border-blue-100 px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-[#f0f6ff] flex items-center justify-center text-slate-600 shrink-0"><Menu size={18} /></button>
          <button onClick={() => setCollapsed(v => !v)} className="hidden md:flex w-8 h-8 rounded-lg hover:bg-[#f0f6ff] items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"><LayoutDashboard size={16} /></button>
          <div className="flex-1 relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="w-full pl-9 pr-4 py-2 bg-[#f0f6ff] border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 font-medium" />
          </div>
          <div className="ml-auto shrink-0">
            <button className="relative w-9 h-9 rounded-xl hover:bg-[#f0f6ff] flex items-center justify-center text-slate-500">
              <Bell size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Reports</h1>
            <p className="text-slate-400 text-sm mt-0.5">Generate and review AI-powered diagnostic summaries</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight pr-2">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}><Icon size={15} className={color} /></div>
                </div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-blue-200">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Brain size={24} className="text-blue-300" /></div>
              <p className="text-slate-500 font-bold text-sm">{search ? "No reports match your search." : "No reports available."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const st      = STATUS_COLORS[item.status] ?? STATUS_COLORS.elevated;
                const isOpen  = expanded === item.id;
                const hasAI   = !!(item.interpretation || item.aiAnalysis);
                const isGen   = generating === item.id;
                const aiText  = item.aiAnalysis || item.interpretation || "";

                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-blue-50 overflow-hidden hover:border-blue-200 transition-all">
                    {/* Row */}
                    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <FlaskConical size={19} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide truncate">{item.testType ?? item.testName ?? "—"}</h3>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                          {hasAI && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 shrink-0">
                              <Sparkles size={9} /> AI Ready
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-semibold truncate">
                          {item.patient?.name ?? "Unknown"}<span className="mx-1.5 text-slate-300">·</span>MRN: {item.patient?.mrn ?? "—"}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!hasAI ? (
                          <button onClick={() => generateReport(item.id)} disabled={isGen}
                            className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-xs font-bold px-3 h-9 transition-all disabled:opacity-60">
                            {isGen ? <Loader2 className="animate-spin" size={13} /> : <Brain size={13} />}
                            {isGen ? "Running…" : "Generate"}
                          </button>
                        ) : (
                          <button onClick={() => setExpanded(isOpen ? null : item.id)}
                            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold px-3 h-9 transition-all">
                            {isOpen ? "Hide" : "View"}
                            <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                        <Link href={`/doctor/review/${item.id}`}>
                          <button className="bg-[#003a66] hover:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase h-9 px-3 flex items-center gap-1.5 transition-all">
                            Review <ChevronRight size={13} />
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Expanded AI analysis */}
                    {isOpen && hasAI && (
                      <div className="border-t border-blue-50 bg-[#f7faff] p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Brain size={12} className="text-purple-600" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest">AI Diagnostic Summary</p>
                        </div>
                        <div className="bg-white rounded-xl border border-blue-50 p-4">
                          <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{aiText}</p>
                        </div>
                        <div className="flex items-start gap-2 mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-amber-700 font-medium">AI analysis is a decision-support tool. Always apply clinical judgment.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}