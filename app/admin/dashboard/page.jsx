"use client";
import { Users, Stethoscope, Clock, CalendarCheck, ArrowUpRight, LayoutDashboard, Settings, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Patients", value: "1,250", icon: <Users size={24} />, color: "text-blue-600", bgColor: "bg-blue-50", trend: "+12% this month" },
    { label: "Doctors on Duty", value: "08", icon: <Stethoscope size={24} />, color: "text-emerald-600", bgColor: "bg-emerald-50", trend: "All depts active" },
    { label: "Pending Reviews", value: "24", icon: <Clock size={24} />, color: "text-amber-600", bgColor: "bg-amber-50", trend: "Needs attention" },
    { label: "New Today", value: "42", icon: <CalendarCheck size={24} />, color: "text-purple-600", bgColor: "bg-purple-50", trend: "From portal" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-[#0f172a] text-white p-8 space-y-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-black text-xl">+</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic">Alatyon Admin</h2>
        </div>
        <nav className="space-y-3 flex-1">
          <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-2xl cursor-pointer shadow-lg shadow-blue-600/20">
            <LayoutDashboard size={20} /> <span className="font-bold text-sm uppercase tracking-wider">Overview</span>
          </div>
          <div className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl cursor-pointer group transition-all text-slate-400 hover:text-white">
            <Users size={20} /> <span className="font-bold text-sm uppercase tracking-wider">Staff Management</span>
          </div>
          <div className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl cursor-pointer group transition-all text-slate-400 hover:text-white">
            <Settings size={20} /> <span className="font-bold text-sm uppercase tracking-wider">Settings</span>
          </div>
        </nav>
        <div className="pt-6 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10 rounded-xl" onClick={() => window.location.href = '/admin/login'}>
            <LogOut className="mr-3 h-5 w-5" /> <span className="font-bold uppercase text-xs">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Hospital Control Panel</p>
          </div>
          <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            <Plus size={18} /> Register Staff
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} /> Live
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 italic">{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Table Placeholder */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Activity Log</h3>
            <p className="text-slate-400 text-sm max-w-xs mt-2">All system logs and staff actions will appear here in real-time.</p>
        </div>
      </div>
    </div>
  );
}