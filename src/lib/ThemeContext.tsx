"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "deep-black";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("aarfin_theme") as ThemeMode;
    if (savedTheme === "deep-black" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "light" ? "deep-black" : "light";
    setTheme(nextTheme);
    localStorage.setItem("aarfin_theme", nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`theme-${theme} min-h-screen transition-colors duration-300`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
