"use client";

import { Bell, Search, Calendar } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <header 
      className="h-16 border-b px-6 flex items-center justify-between sticky top-0 z-30 ml-64 transition-colors duration-300 backdrop-blur-md"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)"
      }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs opacity-70 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Customer, Receipt or Batch..."
            className="w-64 border rounded-xl text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-[#0F766E] transition-all"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)"
            }}
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Date Display Badge */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{currentDate}</span>
        </div>

        {/* Audit Notification Icon */}
        <button 
          className="p-2 rounded-xl border opacity-80 hover:opacity-100 transition-colors relative cursor-pointer"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
      </div>
    </header>
  );
}
