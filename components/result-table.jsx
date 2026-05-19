"use client";

import { Eye, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function StatusBadge({ status }) {
  const statusStyles = {
    Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
    High: "bg-red-100 text-red-700 border-red-200",
    Low: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        statusStyles[status] || statusStyles.Normal
      )}
    >
      {status}
    </span>
  );
}

export function ResultTable({ results }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Test Name
            </th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Result
            </th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Normal Range
            </th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Date
            </th>
            <th className="text-right py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-muted/50 transition-colors">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-foreground">{result.testName}</p>
                  <p className="text-xs text-muted-foreground">{result.fullName}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={cn(
                    "font-medium",
                    result.status === "High" && "text-red-600",
                    result.status === "Low" && "text-amber-600",
                    result.status === "Normal" && "text-foreground"
                  )}
                >
                  {result.result}
                </span>
              </td>
              <td className="py-4 px-4 text-muted-foreground">{result.normalRange}</td>
              <td className="py-4 px-4">
                <StatusBadge status={result.status} />
              </td>
              <td className="py-4 px-4 text-muted-foreground">{result.date}</td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/results/${result.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View result">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download result">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Print result">
                    <Printer className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
