"use client";

import { useState, useEffect } from "react";
import {
  Beaker, FlaskConical, ClipboardCheck, LayoutDashboard,
  Settings, LogOut, Menu, X, TrendingUp, Clock3,
  CheckCircle2, AlertCircle, ChevronRight, Activity,
  Users, Calendar
} from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/lab",           active: true },
  { icon: FlaskConical,    label: "Upload Results", href: "/lab/upload" },
  { icon: ClipboardCheck,  label: "Recent Uploads", href: "/lab/recent" },

];

const STATUS_MAP = {
  pending:  { bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400",   label: "Pending" },
  reviewed: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", label: "Reviewed" },
  default:  { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400",    label: "Uploaded" },
};

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#003a66] flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:shrink-0`}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Beaker size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">Alatyon</p>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Lab System</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <nav className="flex-1 py-5 px-3 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all
                ${active ? "bg-blue-500 text-white shadow-lg shadow-blue-900/30" : "text-white/50 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={17} className="shrink-0" />{label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0">LT</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">Lab Technician</p>
            <p className="text-white/40 text-[10px]">Alatyon Lab</p>
          </div>
          <LogOut size={14} className="text-white/30 hover:text-white cursor-pointer" />
        </div>
      </aside>
    </>
  );
}

export default function LabDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lab/recent")
      .then(r => r.json())
      .then(d => { if (d.success) setRecent(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total    = recent.length;
  const pending  = recent.filter(r => r.status === "pending").length;
  const reviewed = recent.filter(r => r.status === "reviewed").length;
  const patients = new Set(recent.map(r => r.patient?.mrn)).size;

  const stats = [
    { label: "Total Uploaded",   value: total,    icon: FlaskConical,  color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Pending Review",   value: pending,  icon: Clock3,        color: "text-amber-600",   bg: "bg-amber-50" },
    { label: "Reviewed",         value: reviewed, icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Patients Today",   value: patients, icon: Users,         color: "text-purple-600",  bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-[#eef3fa] font-sans">
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="bg-white border-b border-blue-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-[#eef3fa] flex items-center justify-center text-slate-600 shrink-0">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-none">Dashboard</h1>
              <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">Welcome back, Lab Technician</p>
            </div>
            <div className="ml-auto">
              <Link href="/lab/upload">
                <button className="flex items-center gap-2 bg-[#003a66] hover:bg-[#004f8c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
                  <FlaskConical size={14} /> New Upload
                </button>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-blue-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide leading-tight">{label}</p>
                    <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon size={15} className={color} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-800">{loading ? "—" : value}</p>
                </div>
              ))}
            </div>

            {/* Activity summary + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-blue-50 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Quick Actions</p>
                <div className="space-y-2">
                  {[
                    { label: "Upload New Results", href: "/lab/upload",   icon: FlaskConical,   color: "bg-blue-50 text-blue-600" },
                    { label: "View Recent Uploads", href: "/lab/recent",  icon: ClipboardCheck, color: "bg-emerald-50 text-emerald-600" },
                   
                  ].map(({ label, href, icon: Icon, color }) => (
                    <Link key={label} href={href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0f6ff] transition-all group">
                      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon size={15} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 flex-1">{label}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recent Activity</p>
                  <Link href="/lab/recent" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-wide">View all</Link>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity size={24} className="text-blue-100 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recent.slice(0, 5).map((item, i) => {
                      const st = STATUS_MAP[item.status] ?? STATUS_MAP.default;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#f7faff] rounded-xl border border-blue-50">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            <FlaskConical size={14} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-700 truncate">{item.testName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{item.patient?.name} · {item.patient?.mrn}</p>
                          </div>
                          <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}