"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FlaskConical, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/results",   label: "Lab Results", icon: FlaskConical },
  { href: "/profile",   label: "Profile",     icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger — only shown on small screens */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-[14px] left-4 z-50 lg:hidden bg-white shadow-sm border h-9 w-9 rounded-xl"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-[#003a66] text-white flex flex-col z-50 transition-transform duration-300 shadow-xl",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <Link href="/dashboard" onClick={() => setOpen(false)}
            className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 shrink-0">
              <span className="text-[#003a66] font-black text-xl leading-none">+</span>
            </div>
            <div>
              <h1 className="font-black text-base leading-none">Alatyon</h1>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest mt-1">Hospital</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-white text-[#003a66] shadow-md"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}>
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#003a66]" : "text-blue-300")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-[10px] text-blue-100/40 leading-relaxed">
            © 2026 Alatyon Health.<br />All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}