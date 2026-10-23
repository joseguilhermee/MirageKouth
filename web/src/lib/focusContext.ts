import { FOCUS_SCROLL_MS } from "./motion";

/** Reveal a complete prompt/control block without letting native focus jump first. */
export function focusContext(block: HTMLElement, control: HTMLElement) {
  const viewport = window.visualViewport;
  let frame = 0;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let released = false;
  let interrupted = false;
  const stopOnInput = () => {
    interrupted = true;
    cancelAnimationFrame(frame);
    viewport?.removeEventListener("resize", resized);
  };
  const center = () => {
    if (released || interrupted || !block.isConnected || document.activeElement !== control) return;
    const height = viewport?.height ?? window.innerHeight;
    const offset = viewport?.offsetTop ?? 0;
    const footer = document.querySelector<HTMLElement>(".kouth-progress");
    const footerHeight = footer && getComputedStyle(footer).position === "sticky" ? footer.offsetHeight : 0;
    const available = height - footerHeight;
    const rect = block.getBoundingClientRect();
    const top = offset + Math.max(20, (available - rect.height) / 2);
    const destination = Math.max(0, window.scrollY + rect.top - top);
    cancelAnimationFrame(frame);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: destination, behavior: "instant" });
      return;
    }
    const origin = window.scrollY;
    const started = performance.now();
    const animate = (now: number) => {
      if (released || interrupted || document.activeElement !== control) return;
      const progress = Math.min(1, (now - started) / FOCUS_SCROLL_MS);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      window.scrollTo({ top: origin + (destination - origin) * eased, behavior: "instant" });
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  };
  const resized = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(center, 80);
  };
  control.focus({ preventScroll: true });
  const inputs = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  frame = requestAnimationFrame(() => {
    inputs.forEach(type => window.addEventListener(type, stopOnInput, { passive: true }));
    frame = requestAnimationFrame(center);
  });
  viewport?.addEventListener("resize", resized);
  // Only follow the initial keyboard reveal; subsequent typing/scrolling is free.
  const timeout = setTimeout(() => viewport?.removeEventListener("resize", resized), FOCUS_SCROLL_MS + 700);
  return () => {
    released = true;
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    clearTimeout(resizeTimer);
    viewport?.removeEventListener("resize", resized);
    inputs.forEach(type => window.removeEventListener(type, stopOnInput));
  };
}
