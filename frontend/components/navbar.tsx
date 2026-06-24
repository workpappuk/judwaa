"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FiHome, FiMaximize, FiMinimize, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "next-themes";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsFullscreen, setThemeMode, type ThemeMode } from "@/store/slices/uiSlice";

export function Navbar() {
  const dispatch = useAppDispatch();
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { setTheme, resolvedTheme } = useTheme();
  const currentTheme: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      dispatch(setThemeMode(resolvedTheme));
    }
  }, [dispatch, resolvedTheme]);

  useEffect(() => {
    const onFullscreenChange = () => {
      dispatch(setIsFullscreen(Boolean(document.fullscreenElement)));
    };

    onFullscreenChange();
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [dispatch]);

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";
    dispatch(setThemeMode(nextTheme));
    setTheme(nextTheme);
  };

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore browser permission and unsupported fullscreen errors.
    }
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
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 h-8 w-8 active:scale-95 transition"
            aria-label="Toggle fullscreen"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <FiMinimize className="h-4 w-4" /> : <FiMaximize className="h-4 w-4" />}
          </button>

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
      </div>
    </header>
  );
}