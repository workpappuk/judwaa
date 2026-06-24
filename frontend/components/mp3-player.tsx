"use client";

import { useEffect, useId, useRef } from "react";

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

  return (
    <section
      className={showUI
        ? `rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 ${className ?? ""}`
        : `absolute w-px h-px overflow-hidden opacity-0 pointer-events-none ${className ?? ""}`}
      aria-hidden={!showUI}
    >
      {showUI ? (
        <label
          htmlFor={audioId}
          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          {title}
        </label>
      ) : null}

      <audio
        id={audioId}
        ref={audioRef}
        controls={showUI}
        preload={preload}
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        className="w-full"
      >
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </section>
  );
}
