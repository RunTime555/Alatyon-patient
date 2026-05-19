"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/patient-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "መግባት አልተቻለም። እባክዎ መረጃዎን ያረጋግጡ።");
        setIsLoading(false);
      }
    } catch (err) {
      setError("የሲስተም ችግር አጋጥሟል።");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-background to-cyan-50/30 font-sans">
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-[#004a7c] mb-2 italic tracking-tight">Alatyon Hospital</h1>
            <p className="text-slate-500 font-medium text-sm">Sign in to your professional account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs text-center font-bold animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              {/* Email/MRN Input */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-bold text-slate-700 ml-1">Email or MRN</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="identifier"
                    placeholder="Enter MRN or Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-[#004a7c]/10"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" name="password" className="text-xs font-bold text-slate-700">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[11px] font-black text-[#004a7c] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-[#004a7c]/10"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#004a7c] hover:bg-[#00365c] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-95" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login to System"}
              </Button>

              {/* Footer inside Card */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 font-medium">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-[#004a7c] font-black hover:underline">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Small Copyright outside */}
          <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} Alatyon Patient Lab System
          </p>
        </div>
      </main>
    </div>
  );
}