"use client";

import Sidebar from "@/components/sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. የጎን ማውጫ (Sidebar) */}
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-64">
        {/* 2. ቋሚ ሄደር (Header) - እዚህ ጋር ጨመርነው */}
        <Header title="Patient Dashboard" />

        {/* 3. ዋናው የይዘት ክፍል */}
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}