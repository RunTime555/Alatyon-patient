"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header({ title }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Header user fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const getInitial = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return "bg-red-600";
      case "labtechnician": return "bg-blue-600";
      case "doctor": return "bg-emerald-600";
      default: return "bg-[#004a7c]"; 
    }
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm print:hidden">
      
      {/* ግራ በኩል: Title */}
      <div className="flex items-center gap-4">
        <div className="w-10 lg:hidden flex-shrink-0" />
        <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] truncate max-w-[150px] md:max-w-none">
          {title}
        </h2>
      </div>

      {/* ቀኝ በኩል: Profile (መጀመሪያ) እና Logout (መጨረሻ) */}
      <div className="flex items-center gap-2 md:gap-6">
        
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
        ) : (
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* 1. User Profile Section (አሁን መጀመሪያ መጥቷል) */}
            <div className="flex items-center gap-3 border-r pr-4 border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 leading-none uppercase">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">
                  {user?.role || "Patient"}
                </p>
              </div>
              
              <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-slate-50 shadow-sm flex-shrink-0">
                {user?.image ? (
                  <img src={user.image} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className={cn("text-white text-[10px] font-black", getRoleColor(user?.role))}>
                    {getInitial(user?.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* 2. Logout Button (አሁን መጨረሻ ላይ ሆኗል) */}
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:bg-red-50 hover:text-red-600 font-bold gap-2 text-xs h-9 px-2 md:px-3 rounded-xl transition-all"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Log out</span>
              </Button>
            </Link>

          </div>
        )}
      </div>
    </header>
  );
}