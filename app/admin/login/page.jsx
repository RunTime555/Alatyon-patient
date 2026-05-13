"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: email, 
          password 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // የሮል ስሞች ከ seed.ts ጋር አንድ መሆናቸውን ያረጋግጣል
        const userRole = data.role;

        if (userRole === 'Doctor') {
          router.push("/admin/doctor-dashboard");
        } else if (userRole === 'LabTech') {
          router.push("/admin/lab-dashboard");
        } else if (userRole === 'Admin') {
          router.push("/admin/dashboard");
        } else {
          // ማንኛውም ሌላ ሮል ካለ ወደ ዋናው አድሚን ይልካል
          router.push("/admin/dashboard");
        }
      } else {
        setError(data.error || "የመለያ መረጃው አልተገኘም ወይም ስህተት ነው");
        setIsLoading(false);
      }
    } catch (err) {
      setError("የሰርቨር ግንኙነት ተቋርጧል። እባክዎ ድጋሚ ይሞክሩ።");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] space-y-6">
          
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#004a7c] rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-900/20 transition-transform hover:scale-105">
                <span className="text-white font-black text-3xl">+</span>
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-4">ALATYON STAFF</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#004a7c] to-emerald-500"></div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
              {error && (
                <div className="p-4 flex items-center gap-3 text-[12px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Work Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#004a7c] transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="name@alatyon.com" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#004a7c] focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#004a7c] transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#004a7c] focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-[#004a7c] hover:bg-[#003a63] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 gap-3 transition-all active:scale-[0.98] group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <Link href="/" className="text-[11px] font-black text-slate-400 hover:text-[#004a7c] transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <span className="opacity-50">←</span> Back to Main Website
            </Link>
          </div>
        </div>
      </div>

      <footer className="p-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Alatyon Security Verified</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            © 2026 Alatyon Specialized Hospital. Admin Support v2.1
          </p>
        </div>
      </footer>
    </div>
  );
}