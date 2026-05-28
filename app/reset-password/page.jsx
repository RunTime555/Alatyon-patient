"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  // ✅ FIX: read ?token= not ?email=
  const [token, setToken]                   = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState("");
  const [isSuccess, setIsSuccess]           = useState(false);
  const [tokenMissing, setTokenMissing]     = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
      setToken(t);
    } else {
      // No token in URL — invalid/expired link
      setTokenMissing(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ FIX: send token not email
        body: JSON.stringify({ token, newPassword }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Invalid / missing token ───────────────────────────────────────────────
  if (tokenMissing) {
    return (
      <div className="text-center p-10 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Reset Link</h2>
        <p className="text-slate-500 mb-8">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button onClick={() => router.push("/forgot-password")} className="w-full bg-blue-600 h-12">
          Request New Link
        </Button>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h2>
        <p className="text-slate-500 mb-8">
          Your password has been changed successfully. Redirecting you to login…
        </p>
        <Button onClick={() => router.push("/login")} className="w-full bg-blue-600 h-12">
          Go to Login Now
        </Button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blue-900">Set New Password</h2>
        <p className="text-slate-500 text-sm mt-2">Enter a strong new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>
        )}

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input id="newPassword" type="password" value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="pl-10 h-12" placeholder="Min. 8 characters" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input id="confirmPassword" type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="pl-10 h-12" placeholder="••••••••" required />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600 h-10 w-10" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}