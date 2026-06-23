"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useAppDispatch } from "@/store/hooks";
import { setThemeMode, type ThemeMode } from "@/store/slices/uiSlice";

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3a8 8 0 1 0 9 9 7 7 0 1 1-9-9" />
    </svg>
  );
}

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
          <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Judwaa
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/trading" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
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
          {currentTheme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}