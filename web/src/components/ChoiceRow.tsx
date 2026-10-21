"use client";

import { useState } from "react";
import type { Choice, ChoiceAnswer } from "@/lib/questions";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";

const PILL = "px-4 py-2 rounded-full border text-sm transition";
const PILL_ON = "border-accent bg-accent/15 text-foreground";
const PILL_OFF = "border-border text-foreground/70 hover:border-muted";
const SUB_PILL = "px-3 py-1.5 rounded-full border text-xs transition";

/**
 * Uma linha de botões: opções (escolha única ou múltipla), a segunda camada
 * de quem/qual que algumas opções abrem, e o "especificar". Nada vem marcado.
 */
export function ChoiceRow({
  choice,
  answer,
  invalid,
  onChange,
}: {
  choice: Choice;
  answer: ChoiceAnswer | undefined;
  invalid: boolean;
  onChange: (answer: ChoiceAnswer) => void;
}) {
  const selected = answer?.selected ?? [];
  const specify = answer?.specify ?? "";
  // "outro" marcado obriga a especificar, então o campo abre sozinho.
  const needsSpecify = choice.options.some((o) => o.needsSpecify && selected.includes(o.label));
  const [specifyOpen, setSpecifyOpen] = useState(specify.length > 0);
  const showSpecify = specifyOpen || needsSpecify;
  const specifyRef = useAutoGrowTextarea(specify);

  function toggle(label: string) {
    const option = choice.options.find((o) => o.label === label);
    let next: string[];
    if (!choice.multi) next = [label];
    else if (selected.includes(label)) next = selected.filter((l) => l !== label);
    else if (option?.exclusive) next = [label];
    else
      next = [
        ...selected.filter((l) => !choice.options.find((o) => o.label === l)?.exclusive),
        label,
      ];
    // Sub-marcações de opções que saíram não valem mais.
    const sub = Object.fromEntries(
      Object.entries(answer?.sub ?? {}).filter(([l]) => next.includes(l))
    );
    onChange({ ...answer, selected: next, sub });
  }

  function toggleSub(parent: string, label: string) {
    const current = answer?.sub?.[parent] ?? [];
    const nextSub = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    onChange({ selected, ...answer, sub: { ...answer?.sub, [parent]: nextSub } });
  }

  return (
    <div role="group" aria-label={choice.prompt}>
      <p
        className={`text-base leading-relaxed mb-2 transition-colors ${
          invalid ? "text-accent-2" : "text-foreground/70"
        }`}
      >
        {choice.prompt}
        {choice.multi && (
          <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-muted">
            PODE MARCAR MAIS DE UMA
          </span>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {choice.options.map((option) => {
          const isOn = selected.includes(option.label);
          return (
            <button
              key={option.label}
              type="button"
              role={choice.multi ? "checkbox" : "radio"}
              aria-checked={isOn}
              onClick={() => toggle(option.label)}
              className={`${PILL} ${isOn ? PILL_ON : PILL_OFF}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {choice.options
        .filter((o) => o.sub && selected.includes(o.label))
        .map((option) => {
          const subSelected = answer?.sub?.[option.label] ?? [];
          const subMissing = invalid && subSelected.length === 0;
          return (
            <div key={option.label} className="mt-3 ml-3 pl-3 border-l border-accent/30">
              <p className={`text-sm mb-2 ${subMissing ? "text-accent-2" : "text-foreground/60"}`}>
                {option.sub!.prompt}
                <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-muted">
                  PODE MARCAR MAIS DE UMA
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {option.sub!.options.map((label) => {
                  const isOn = subSelected.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      role="checkbox"
                      aria-checked={isOn}
                      onClick={() => toggleSub(option.label, label)}
                      className={`${SUB_PILL} ${isOn ? PILL_ON : PILL_OFF}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {showSpecify ? (
        <textarea
          ref={specifyRef}
          rows={1}
          autoFocus={specifyOpen && !needsSpecify}
          value={specify}
          onChange={(e) => onChange({ selected, ...answer, specify: e.target.value })}
          placeholder={needsSpecify ? "Especifique…" : "Especifique, se quiser…"}
          aria-label={`Especificar: ${choice.prompt}`}
          className={`mt-3 w-full bg-transparent border-b outline-none text-base py-2 placeholder:text-muted/50 transition-colors font-display resize-none leading-snug ${
            invalid && needsSpecify && specify.trim().length < 2
              ? "border-accent-2"
              : "border-border focus:border-accent"
          }`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setSpecifyOpen(true)}
          className="mt-2 text-xs font-mono tracking-[0.15em] text-muted hover:text-foreground transition"
        >
          + ESPECIFICAR
        </button>
      )}
    </div>
  );
}
