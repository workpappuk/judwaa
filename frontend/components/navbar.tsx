"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FiLogOut, FiMaximize, FiMenu, FiMinimize, FiMoon, FiPause, FiPlay, FiSun, FiUser } from "react-icons/fi";
import { useTheme } from "next-themes";
import { AppBar, Box, IconButton, Toolbar, Typography, Button as MuiButton } from "@mui/material";

import { logoutUser } from "@/services/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store/slices/authSlice";
import { setIsAudioPlaying, setIsFullscreen, setThemeMode, toggleSidebar, type ThemeMode } from "@/store/slices/uiSlice";

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

  if (isFullscreen) {
    return null;
  }

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider", backdropFilter: "blur(6px)", bgcolor: "background.paper" }}>
      <audio ref={audioRef} src="/audio/fno-background.mp3" preload="auto" loop playsInline style={{ display: "none" }} />

      <Toolbar sx={{ minHeight: 56, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }} aria-label="Go to home">
            <Typography sx={{ fontWeight: 800, textTransform: "uppercase", color: "text.primary" }}>
              Judwaa
            </Typography>
          </Link>

          <IconButton size="small" onClick={() => dispatch(toggleSidebar())} aria-label="Toggle navigation sidebar" title="Toggle sidebar">
            <FiMenu />
          </IconButton>

          {!authSession ? (
            <MuiButton component={Link} href="/auth" size="small" startIcon={<FiUser />}>
              Login
            </MuiButton>
          ) : null}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {authSession ? (
            <MuiButton size="small" variant="outlined" onClick={handleLogout} startIcon={<FiLogOut />} title={`Logout ${authSession.username}`}>
              Logout
            </MuiButton>
          ) : null}

          <IconButton size="small" onClick={handleAudioToggle} aria-label="Toggle background audio" aria-pressed={isAudioPlaying} title={isAudioPlaying ? "Pause audio" : "Play audio"}>
            {isAudioPlaying ? <FiPause /> : <FiPlay />}
          </IconButton>

          <IconButton size="small" onClick={handleFullscreenToggle} aria-label="Toggle fullscreen" aria-pressed={isFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
          </IconButton>

          <IconButton size="small" onClick={handleThemeToggle} aria-label="Toggle theme" aria-pressed={currentTheme === "dark"} title={currentTheme === "dark" ? "Switch to light" : "Switch to dark"}>
            {currentTheme === "dark" ? <FiSun /> : <FiMoon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
