"use client";
import { useState, useEffect } from "react";
import {
  Brain, Beaker, ChevronRight, Loader2, LayoutDashboard,
  ClipboardList, Users, LogOut, Bell, Search,
  Menu, X, TrendingUp, CheckCircle2, Clock3, AlertCircle
} from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/doctor",           active: true },
  { icon: ClipboardList,   label: "Pending Reviews", href: "/doctor/pending" },
  { icon: Users,           label: "Patients",        href: "/doctor/patients" },
  
];

const STATUS_COLORS = {
  critical:        { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500",    label: "Critical" },
  elevated:        { bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-500",  label: "Elevated" },
  normal:          { bg: "bg-emerald-50",text: "text-emerald-600",dot: "bg-emerald-500",label: "Normal"   },
  PENDING_DOCTOR:  { bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-500",   label: "Pending"  },
  COMPLETED:       { bg: "bg-emerald-50",text: "text-emerald-600",dot: "bg-emerald-500",label: "Done"     },
  REJECTED:        { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500",    label: "Rejected" },
};

function Sidebar({ open, onClose, collapsed, onCollapse }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#003a66] flex flex-col
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shrink-0
          ${collapsed ? "md:w-[68px]" : "md:w-60"}
          w-60
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Beaker size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-none">Alatyon</p>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Doctor Portal</p>
            </div>
          )}
          <button onClick={onClose} className="md:hidden text-white/40 hover:text-white ml-auto shrink-0">
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${active
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                  : "text-white/50 hover:bg-white/10 hover:text-white"}
              `}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-semibold">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/10 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                DR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">Dr. User</p>
                <p className="text-white/40 text-[10px]">Physician</p>
              </div>
              <button className="text-white/30 hover:text-white transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                DR
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function DoctorDashboard() {
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);

  useEffect(() => {
    fetch("/api/doctor/pending")
      .then(r => r.json())
      .then(d => { setResults(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = results.filter(r =>
    !search ||
    r.testType?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.mrn?.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = results.filter(r =>
    ["critical", "CRITICAL"].includes(r.status)
  ).length;

  const stats = [
    { label: "Pending Reviews", value: results.length, icon: Clock3,       color: "text-blue-600",    bg: "bg-blue-50"    },
    { label: "Reviewed Today",  value: 0,              icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Critical Cases",  value: criticalCount,  icon: AlertCircle,  color: "text-red-600",     bg: "bg-red-50"     },
    { label: "AI Analyses",     value: 0,              icon: TrendingUp,   color: "text-purple-600",  bg: "bg-purple-50"  },
  ];

  return (
    <div className="flex h-screen bg-[#f0f6ff] font-sans overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(v => !v)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Topbar ── */}
        <header className="bg-white border-b border-blue-100 px-4 py-3 flex items-center gap-3 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-[#f0f6ff] flex items-center justify-center text-slate-600 shrink-0"
          >
            <Menu size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden md:flex w-8 h-8 rounded-lg hover:bg-[#f0f6ff] items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <LayoutDashboard size={16} />
          </button>

          {/* Search */}
          <div className="flex-1 relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patients or tests…"
              className="w-full pl-9 pr-4 py-2 bg-[#f0f6ff] border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 font-medium"
            />
          </div>

          {/* Bell */}
          <div className="ml-auto shrink-0">
            <button className="relative w-9 h-9 rounded-xl hover:bg-[#f0f6ff] flex items-center justify-center text-slate-500 transition-colors">
              <Bell size={16} />
              {results.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* ── Scrollable main ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Pending Lab Reviews</h1>
            <p className="text-slate-400 text-sm mt-0.5">Review and approve AI-assisted lab result analyses</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight pr-2">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Results list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-dashed border-blue-200">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={24} className="text-blue-300" />
              </div>
              <p className="text-slate-500 font-bold text-sm">
                {search ? "No results match your search." : "No pending results to review."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const st = STATUS_COLORS[item.status] ?? STATUS_COLORS.elevated;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-blue-50 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <Beaker size={19} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide truncate">
                          {item.testType ?? item.testName ?? "—"}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold truncate">
                        {item.patient?.name ?? "Unknown patient"}
                        <span className="mx-1.5 text-slate-300">·</span>
                        MRN: {item.patient?.mrn ?? "—"}
                      </p>
                    </div>

                    {/* Date */}
                    {item.createdAt && (
                      <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs font-semibold shrink-0">
                        <Clock3 size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    )}

                    {/* CTA */}
                    <Link href={`/doctor/review/${item.id}`} className="shrink-0">
                      <button className="bg-[#003a66] hover:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase h-9 px-3 sm:px-4 flex items-center gap-1.5 transition-all">
                        Review <ChevronRight size={13} />
                      </button>
                    </Link>
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