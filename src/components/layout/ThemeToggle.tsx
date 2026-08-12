"use client";

import { useTheme } from "@/lib/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "deep-black";

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm cursor-pointer hover:opacity-90"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)"
      }}
      title={`Switch to ${isDark ? "Light" : "Deep Black"} Theme`}
    >
      {isDark ? (
        <>
          <Moon className="w-4 h-4 text-amber-400" />
          <span>Deep Black</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-[#0F766E]" />
          <span>Light Mode</span>
        </>
      )}
    </button>
  );
}
