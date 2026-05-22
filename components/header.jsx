"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header({ title }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUser(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":          return "bg-red-600";
      case "labtechnician":  return "bg-blue-600";
      case "doctor":         return "bg-emerald-600";
      default:               return "bg-[#003a66]";
    }
  };

  return (
    <header className="h-16 border-b border-blue-100 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm print:hidden shrink-0">

      {/* Left — spacer for mobile hamburger + title */}
      <div className="flex items-center gap-3">
        {/* 40px spacer aligns title past the hamburger button on mobile */}
        <div className="w-10 lg:hidden shrink-0" />
        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] truncate max-w-[140px] sm:max-w-none">
          {title}
        </p>
      </div>

      {/* Right — user info + logout */}
      <div className="flex items-center gap-2 md:gap-4">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
        ) : (
          <>
            {/* User info */}
            <div className="flex items-center gap-2 sm:gap-3 border-r border-slate-100 pr-3 sm:pr-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 leading-none uppercase truncate max-w-[120px]">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-[9px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">
                  {user?.role || "Patient"}
                </p>
              </div>
              <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-blue-50 shadow-sm shrink-0">
                {user?.image ? (
                  <img src={user.image} alt="profile" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className={cn("text-white text-[10px] font-black", getRoleColor(user?.role))}>
                    {getInitials(user?.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Logout */}
            <Link href="/">
              <Button
                variant="ghost"
                className="text-slate-400 hover:bg-red-50 hover:text-red-600 font-bold gap-1.5 text-xs h-9 px-2 md:px-3 rounded-xl transition-all"
              >
                <LogOut size={15} />
                <span className="hidden md:inline">Log out</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}