import type { FieldSnap } from "@/components/SealFlight";

/** Guarda texto e posição dos campos para a prévia de cifra voar até a prancheta. */
export function captureFlight(field: HTMLElement): FieldSnap[] {
  const main = field.closest("main");
  const textareas = [...(main?.querySelectorAll("textarea") ?? [])].filter(element => element.value.trim());
  const elements: HTMLElement[] = textareas.length > 0
    ? textareas
    : [...(main?.querySelectorAll<HTMLElement>('button[role="radio"][aria-checked="true"]') ?? [])];

  return elements.map(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      text: element instanceof HTMLTextAreaElement ? element.value : element.textContent?.trim() || "",
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      scrollTop: element.scrollTop,
      font: style.font,
      lineHeight: style.lineHeight,
      padding: style.padding,
    };
  }).filter(snapshot => snapshot.text.trim());
}
