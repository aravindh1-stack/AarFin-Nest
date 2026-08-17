"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 650);
    const hideTimer = setTimeout(() => setHidden(true), 1050);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000000] transition-opacity duration-400 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-teal-500/30" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 shadow-lg shadow-teal-500/30">
          <span className="text-2xl font-bold text-white">N</span>
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold tracking-wide text-slate-300">
        NexFix
      </p>

      <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-[loader-bar_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
      </div>
    </div>
  );
}
