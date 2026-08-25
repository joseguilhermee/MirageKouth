"use client";

import { useLayoutEffect, useRef } from "react";

const MAX_HEIGHT_PX = 340;

/** Cresce o textarea junto com o conteúdo até um teto, depois passa a rolar por dentro. */
export function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value]);

  return ref;
}
