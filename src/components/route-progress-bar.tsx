"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the very first mount — the PageLoader splash already covers it.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];

    setVisible(true);
    setProgress(20);

    timers.current.push(window.setTimeout(() => setProgress(65), 100));
    timers.current.push(window.setTimeout(() => setProgress(90), 280));
    timers.current.push(
      window.setTimeout(() => {
        setProgress(100);
        timers.current.push(
          window.setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 300),
        );
      }, 450),
    );

    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-[150] h-[3px] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(20,184,166,0.6)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
