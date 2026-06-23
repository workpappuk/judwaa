"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FiHome, FiMoon, FiSun, FiTrendingUp } from "react-icons/fi";
import { useTheme } from "next-themes";

import { useAppDispatch } from "@/store/hooks";
import { setThemeMode, type ThemeMode } from "@/store/slices/uiSlice";

export function Navbar() {
  const dispatch = useAppDispatch();
  const { setTheme, resolvedTheme } = useTheme();
  const currentTheme: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      dispatch(setThemeMode(resolvedTheme));
    }
  }, [dispatch, resolvedTheme]);

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";
    dispatch(setThemeMode(nextTheme));
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0f141c]/95 backdrop-blur-sm transition-colors">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="display-face text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Judwaa
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <FiHome className="h-3.5 w-3.5" />
              Home
            </Link>
            <Link href="/trading" className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <FiTrendingUp className="h-3.5 w-3.5" />
              Trading
            </Link>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleThemeToggle}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 h-8 w-8 active:scale-95 transition"
          aria-label="Toggle theme"
          title={currentTheme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {currentTheme === "dark" ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}