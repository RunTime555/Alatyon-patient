"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Brain, Beaker, Loader2, LayoutDashboard, ClipboardList,
  Users, LogOut, Bell, Search, Menu, X, Clock3,
  ChevronRight, User2, FlaskConical, ChevronDown, CheckCircle2
} from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/doctor" },
  { icon: ClipboardList,   label: "Pending Reviews", href: "/doctor/pending" },
  { icon: Users,           label: "Patients",        href: "/doctor/patients", active: true },
];

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

export default function DoctorPatients() {
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);

  useEffect(() => {
    // Fetch all results (pending + completed) to build patient list
    Promise.all([
      fetch("/api/doctor/pending").then(r => r.json()),
    ]).then(([pending]) => {
      setResults(Array.isArray(pending) ? pending : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Group results by patient MRN
  const patients = useMemo(() => {
    const map = {};
    results.forEach(r => {
      const mrn = r.patient?.mrn ?? "unknown";
      if (!map[mrn]) {
        map[mrn] = {
          mrn,
          name:    r.patient?.name ?? "Unknown",
          results: [],
        };
      }
      map[mrn].results.push(r);
    });
    return Object.values(map).filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase())
    );
  }, [results, search]);

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
              placeholder="Search by patient name or MRN…"
              className="w-full pl-9 pr-4 py-2 bg-[#f0f6ff] border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 font-medium" />
          </div>
          <div className="ml-auto shrink-0">
            <button className="relative w-9 h-9 rounded-xl hover:bg-[#f0f6ff] flex items-center justify-center text-slate-500">
              <Bell size={16} />
              {results.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Patients</h1>
            <p className="text-slate-400 text-sm mt-0.5">{patients.length} patient{patients.length !== 1 ? "s" : ""} with pending lab results</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
          ) : patients.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-blue-200">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users size={24} className="text-blue-300" /></div>
              <p className="text-slate-500 font-bold text-sm">{search ? "No patients match your search." : "No patients found."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => {
                const isOpen = expanded === patient.mrn;
                const pendingCount = patient.results.length;
                return (
                  <div key={patient.mrn} className="bg-white rounded-2xl border border-blue-50 overflow-hidden hover:border-blue-200 transition-all">
                    {/* Patient row */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : patient.mrn)}
                      className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-400 to-[#003a66] rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0">
                        {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-sm truncate">{patient.name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">MRN: {patient.mrn}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full">
                          {pendingCount} test{pendingCount !== 1 ? "s" : ""}
                        </span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {/* Expanded test list */}
                    {isOpen && (
                      <div className="border-t border-blue-50 px-4 sm:px-5 py-3 space-y-2 bg-[#f7faff]">
                        {patient.results.map((r, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-blue-50 p-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                              <FlaskConical size={14} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-700 truncate">{r.testType ?? r.testName ?? "—"}</p>
                              <p className="text-[10px] text-slate-400">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                              </p>
                            </div>
                            <p className="text-sm font-black text-[#003a66] shrink-0">{r.value ?? r.resultValue ?? "—"}</p>
                            <Link href={`/doctor/review/${r.id}`} className="shrink-0">
                              <button className="bg-[#003a66] hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase h-8 px-3 flex items-center gap-1 transition-all">
                                Review <ChevronRight size={11} />
                              </button>
                            </Link>
                          </div>
                        ))}
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