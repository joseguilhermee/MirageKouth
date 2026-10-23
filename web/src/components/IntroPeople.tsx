"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INTRO_PEOPLE, type IntroPerson } from "@/lib/introPeople";
import { EASE_OUT } from "@/lib/motion";

const CATEGORIES = ["Todos", ...INTRO_PEOPLE.filter((_, i) => i % 2 === 0).map(person => person.archetypes[0].name)];
const FEATURED = ["Leonardo da Vinci", "Amelia Earhart", "Florence Nightingale", "Charlie Chaplin", "Nikola Tesla", "Cleópatra"];
const MEANINGS: Record<string, string> = {
  Todos: "Uma pessoa, vários arquétipos. Explore algumas combinações.",
  Inocente: "A confiança de que a vida pode ser boa.",
  "Pessoa Comum": "A vontade de pertencer e estar junto.",
  Herói: "A coragem de enfrentar o que é difícil.",
  Cuidador: "O impulso de acolher e proteger.",
  Explorador: "A vontade de descobrir novos caminhos.",
  Rebelde: "A força de questionar e romper padrões.",
  Amante: "A busca por conexão, beleza e intensidade.",
  Criador: "A vontade de dar forma às ideias.",
  Bobo: "A leveza de brincar com a vida.",
  Sábio: "A busca por compreender e aprender.",
  Mago: "A vontade de transformar possibilidades em realidade.",
  Governante: "O impulso de organizar e assumir responsabilidades.",
};

function Portrait({ person }: { person: IntroPerson }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-terra font-display text-xl text-terra-ink" aria-hidden>
      {person.initials}
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={person.photo} alt="" width={80} height={96} loading="lazy"
      onError={() => setFailed(true)}
      style={{ objectPosition: person.photoPosition ?? "center" }}
      className="h-24 w-20 shrink-0 rounded-xl object-cover" />
  );
}

export function IntroPeople() {
  const [category, setCategory] = useState("Todos");
  const reduceMotion = useReducedMotion();
  // Lead with a variety of familiar faces; preserve all original associations.
  const people = category === "Todos"
    ? [...INTRO_PEOPLE].sort((a, b) => {
      const aRank = FEATURED.indexOf(a.name);
      const bRank = FEATURED.indexOf(b.name);
      return (aRank < 0 ? FEATURED.length : aRank) - (bRank < 0 ? FEATURED.length : bRank);
    })
    : INTRO_PEOPLE.filter(person => person.archetypes[0].name === category);

  return (
    <section aria-labelledby="people-heading" className="my-7 sm:my-8">
      <h2 id="people-heading" className="font-display text-[23px] font-semibold leading-tight">Veja isso nas pessoas.</h2>
      <div className="mt-4 sm:hidden">
        <label htmlFor="intro-category" className="mb-2 block text-sm text-ink-2">Explorar por arquétipo</label>
        <select id="intro-category" value={category} onChange={event => setCategory(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-line-strong bg-[var(--paper)] px-3 text-base text-ink">
          {CATEGORIES.map(item => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="mt-4 flex gap-6 border-y border-line py-4">
        <div role="group" aria-label="Filtrar pessoas por arquétipo" className="hidden w-36 shrink-0 flex-col items-stretch gap-1 sm:flex">
          {CATEGORIES.map(item => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}
              className={`relative min-h-10 rounded-lg px-3 py-2 text-left text-sm transition-colors ${category === item ? "font-semibold text-action-ink" : "text-ink-2 hover:bg-terra-wash"}`}>
              {category === item && <motion.span layoutId="intro-category-active" className="absolute inset-0 rounded-lg bg-action"
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE_OUT }} />}
              <span className="relative">{item}</span>
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p key={`meaning-${category}`} className="intro-copy-enter mb-3 min-h-11 text-[15px] leading-relaxed text-ink-2">
            {MEANINGS[category]}
          </p>
          <p role="status" className="sr-only">{people.length} exemplos · {category === "Todos" ? "todos os arquétipos" : category}</p>
          <div key={`people-${category}`} role="region" aria-label={`Pessoas: ${category}`} tabIndex={0}
            className="max-h-[350px] overflow-y-auto overscroll-contain pr-2 sm:max-h-[450px]">
            <ul className="divide-y divide-line">
              {people.map((person, index) => (
                <li key={person.name} style={{ animationDelay: `${Math.min(index * 0.06, 0.18)}s` }}
                  className="intro-person-enter flex gap-4 py-4 first:pt-1">
                  <Portrait person={person} />
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold leading-tight">{person.name}</h3>
                    <p className="mt-1 text-[13px] text-ink-2">{person.hint}</p>
                    <ul aria-label="Combinação ilustrativa de arquétipos" className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs">
                      {person.archetypes.map((archetype, i) => (
                        <li key={archetype.name} className={i === 0 ? "font-semibold text-brand" : "text-ink-2"}>
                          {archetype.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">Associações ilustrativas, não classificações definitivas. A mesma pessoa reúne vários arquétipos.</p>
    </section>
  );
}
