"use client";

import { MotionConfig } from "framer-motion";
import { DARK_NIGHT, NIGHT, skyAt } from "@/lib/sky";

/** O céu avança com as perguntas; a noite aparece na tela de selar. */
export function SkyShell({ progress, night, children }: {
  progress: number;
  night?: boolean;
  children: React.ReactNode;
}) {
  const sky = night ? NIGHT : skyAt(progress);
  const dark = night ? DARK_NIGHT : skyAt(progress, "dark");
  return <MotionConfig reducedMotion="user">
    <div data-sky={night ? "night" : "day"} className="sky flex min-h-dvh flex-1 flex-col text-ink"
      style={{
        "--scene-light-top": sky.top, "--scene-light-mid": sky.mid, "--scene-light-low": sky.low,
        "--scene-dark-top": dark.top, "--scene-dark-mid": dark.mid, "--scene-dark-low": dark.low,
      } as React.CSSProperties}>
      {children}
    </div>
  </MotionConfig>;
}
