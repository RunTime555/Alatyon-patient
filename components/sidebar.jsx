"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FlaskConical,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "Lab Results", icon: FlaskConical },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-foreground bg-white shadow-sm border"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#004a7c] text-white flex flex-col z-50 transition-transform duration-300 shadow-xl",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span className="text-[#004a7c] font-black text-xl">+</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Alatyon</h1>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest mt-1">Hospital</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-white text-[#004a7c] shadow-md"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-[#004a7c]" : "text-blue-300")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info only (Logout moved to Header) */}
        <div className="p-6 mt-auto">
          <p className="text-[10px] text-blue-100/40 leading-tight border-t border-white/5 pt-4">
            © 2026 Alatyon Health. <br /> All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}