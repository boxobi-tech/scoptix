"use client";

import { useTheme } from "@/components/theme-provider";

export function AppShellChrome() {
  const { theme } = useTheme();
  const showEffects = theme !== "scoptix";

  if (!showEffects) return null;

  return (
    <>
      <div className="bg-ambient-layer pointer-events-none fixed inset-0 -z-20" />
      <svg className="noise-overlay fixed inset-0 -z-10 h-full w-full" aria-hidden="true">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </>
  );
}
