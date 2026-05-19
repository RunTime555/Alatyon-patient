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
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // በኢሜይል አድራሻው ለይተን ዳይሬክት እናደርጋለን
        if (email === 'doctor@alatyon.com') {
          router.push("/doctor");
        } else if (email === 'lab@alatyon.com') {
          router.push("/lab/upload");
        } else {
          // ሌላ አድሚን ከሆነ
          router.push("/admin/dashboard");
        }
      } else {
        setError(data.error || "የመለያ መረጃው ስህተት ነው");
      }
    } catch (err) {
      setError("የሰርቨር ግንኙነት ተቋርጧል። እባክዎ ድጋሚ ይሞክሩ።");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] space-y-6">
          
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#004a7c] rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-900/20">
                <span className="text-white font-black text-3xl">+</span>
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-4">ALATYON STAFF</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Portal Access</p>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
              {error && (
                <div className="p-4 flex items-center gap-3 text-[12px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <Input 
                    type="email" 
                    placeholder="name@alatyon.com" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-[#004a7c] hover:bg-[#003a63] text-white rounded-2xl font-black shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Sign In to Portal"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}