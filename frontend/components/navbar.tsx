"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FiHome, FiLogOut, FiMaximize, FiMinimize, FiMoon, FiPause, FiPlay, FiSun, FiUser } from "react-icons/fi";
import { useTheme } from "next-themes";

import { logoutUser } from "@/services/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store/slices/authSlice";
import { setIsAudioPlaying, setIsFullscreen, setThemeMode, type ThemeMode } from "@/store/slices/uiSlice";

export function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authSession = useAppSelector((state) => state.auth.session);
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const isAudioPlaying = useAppSelector((state) => state.ui.isAudioPlaying);
  const { setTheme, resolvedTheme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const onPlay = () => dispatch(setIsAudioPlaying(true));
    const onPause = () => dispatch(setIsAudioPlaying(false));

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
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

  const handleAudioToggle = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      dispatch(setIsAudioPlaying(false));
    }
  };

  const handleLogout = async () => {
    try {
      if (authSession?.token) {
        await logoutUser(authSession.token);
      }
    } catch {
      // Clear local session even if backend logout request fails.
    } finally {
      dispatch(clearSession());
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0f141c]/95 backdrop-blur-sm transition-colors">
      <audio
        ref={audioRef}
        src="/audio/fno-background.mp3"
        preload="auto"
        loop
        playsInline
        className="hidden"
      />

      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="display-face  font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
            Judwaa
          </Link>
          <nav className="flex items-center gap-4  font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/" className="text-sm inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <FiHome className="h-3.5 w-3.5" />
              Home
            </Link>
            {!authSession ? (
              <Link href="/auth" className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <FiUser className="h-3.5 w-3.5" />
                Login
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {authSession ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title={`Logout ${authSession.username}`}
            >
              <FiLogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleAudioToggle}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 h-8 w-8 active:scale-95 transition"
            aria-label="Toggle background audio"
            title={isAudioPlaying ? "Pause audio" : "Play audio"}
          >
            {isAudioPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
          </button>

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