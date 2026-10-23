/** Reveal a complete prompt/control block without letting native focus jump first. */
export function focusContext(block: HTMLElement, control: HTMLElement) {
  const viewport = window.visualViewport;
  let frame = 0;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let released = false;
  const center = () => {
    if (released || !block.isConnected || document.activeElement !== control) return;
    const height = viewport?.height ?? window.innerHeight;
    const offset = viewport?.offsetTop ?? 0;
    const footer = document.querySelector<HTMLElement>(".kouth-progress");
    const footerHeight = footer && getComputedStyle(footer).position === "sticky" ? footer.offsetHeight : 0;
    const available = height - footerHeight;
    const rect = block.getBoundingClientRect();
    const top = offset + Math.max(20, (available - rect.height) / 2);
    window.scrollTo({
      top: Math.max(0, window.scrollY + rect.top - top),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };
  const resized = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(center, 80);
  };
  control.focus({ preventScroll: true });
  frame = requestAnimationFrame(() => { frame = requestAnimationFrame(center); });
  viewport?.addEventListener("resize", resized);
  // Only follow the initial keyboard reveal; subsequent typing/scrolling is free.
  const timeout = setTimeout(() => viewport?.removeEventListener("resize", resized), 900);
  return () => {
    released = true;
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    clearTimeout(resizeTimer);
    viewport?.removeEventListener("resize", resized);
  };
}
