"use client";

import { cn } from "@/lib/utils";

export function DashboardCard({ children, className, variant }) {
  return (
    <div className={cn(
      "bg-card p-6 rounded-xl border shadow-sm transition-all duration-200",
      // variant "highlight" ከሆነ ሰማያዊ ያደርገዋል
      variant === "highlight" && "bg-[#004a7c] text-white border-[#004a7c] shadow-lg shadow-blue-900/20",
      className
    )}>
      {children}
    </div>
  );
}

export function MetricCard({ label, value, icon, variant }) {
  return (
    <DashboardCard variant={variant} className="flex items-center justify-between">
      <div>
        <p className={cn(
          "text-xs mb-1",
          variant === "highlight" ? "text-blue-100" : "text-muted-foreground"
        )}>
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={cn(
        "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
        variant === "highlight" 
          ? "bg-white/20 text-white" 
          : "bg-primary/10 text-primary"
      )}>
        {icon}
      </div>
    </DashboardCard>
  );
}