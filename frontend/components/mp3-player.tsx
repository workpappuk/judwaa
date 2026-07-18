"use client";

import { useEffect, useId, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";

type Mp3PlayerProps = {
  src: string;
  title?: string;
  className?: string;
  showUI?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
};

export function Mp3Player({
  src,
  title = "Audio",
  className,
  showUI = true,
  autoPlay = false,
  loop = false,
  preload = "metadata",
}: Mp3PlayerProps) {
  const audioId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!autoPlay || !audioRef.current) {
      return;
    }

    void audioRef.current.play().catch(() => {
      // Browser may block autoplay without user interaction.
    });
  }, [autoPlay, src]);

  if (!showUI) {
    return (
      <Box className={className} sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }} aria-hidden>
        <audio id={audioId} ref={audioRef} controls={false} preload={preload} autoPlay={autoPlay} loop={loop} playsInline>
          <source src={src} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" className={className} sx={{ p: 1.5 }}>
      <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary" }}>
        {title}
      </Typography>
      <audio id={audioId} ref={audioRef} controls preload={preload} autoPlay={autoPlay} loop={loop} playsInline style={{ width: "100%" }}>
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </Paper>
  );
}
