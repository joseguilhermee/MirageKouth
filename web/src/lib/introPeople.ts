// Existing illustrative associations, preserved from the original introduction.
export type IntroPerson = {
  name: string;
  initials: string;
  hint: string;
  photo: string;
  photoPosition?: string;
  archetypes: { name: string }[];
};
export const INTRO_PEOPLE: IntroPerson[] = [
  { name: "Joana d'Arc", initials: "JA", hint: "heroína francesa", photo: "/people/joana-darc.jpg", archetypes: [{ name: "Inocente" }, { name: "Herói" }, { name: "Rebelde" }] },
  { name: "Helen Keller", initials: "HK", hint: "escritora e ativista", photo: "/people/helen-keller.jpg", archetypes: [{ name: "Inocente" }, { name: "Sábio" }, { name: "Herói" }] },
  { name: "Abraham Lincoln", initials: "AL", hint: "16º presidente dos EUA", photo: "/people/abraham-lincoln.jpg", archetypes: [{ name: "Pessoa Comum" }, { name: "Governante" }, { name: "Herói" }] },
  { name: "Charlie Chaplin", initials: "CC", hint: "o vagabundo genial", photo: "/people/charlie-chaplin.jpg", archetypes: [{ name: "Pessoa Comum" }, { name: "Bobo" }, { name: "Criador" }] },
  { name: "Napoleão", initials: "NB", hint: "imperador francês", photo: "/people/napoleao.jpg", archetypes: [{ name: "Herói" }, { name: "Governante" }, { name: "Criador" }] },
  { name: "Alexandre o Grande", initials: "AG", hint: "conquistador macedônio", photo: "/people/alexandre-o-grande.jpg", archetypes: [{ name: "Herói" }, { name: "Governante" }, { name: "Explorador" }] },
  { name: "Florence Nightingale", initials: "FN", hint: "pioneira da enfermagem", photo: "/people/florence-nightingale.jpg", archetypes: [{ name: "Cuidador" }, { name: "Sábio" }, { name: "Rebelde" }] },
  { name: "Clara Barton", initials: "CB", hint: "fundadora da Cruz Vermelha", photo: "/people/clara-barton.jpg", archetypes: [{ name: "Cuidador" }, { name: "Herói" }, { name: "Criador" }] },
  { name: "Cristóvão Colombo", initials: "CC", hint: "navegador genovês", photo: "/people/cristovao-colombo.jpg", archetypes: [{ name: "Explorador" }, { name: "Herói" }, { name: "Rebelde" }] },
  { name: "Amelia Earhart", initials: "AE", hint: "pioneira da aviação", photo: "/people/amelia-earhart.jpg", archetypes: [{ name: "Explorador" }, { name: "Herói" }, { name: "Rebelde" }] },
  { name: "Mahatma Gandhi", initials: "MG", hint: "líder da não-violência", photo: "/people/mahatma-gandhi.jpg", archetypes: [{ name: "Rebelde" }, { name: "Sábio" }, { name: "Cuidador" }] },
  { name: "Robespierre", initials: "MR", hint: "revolucionário francês", photo: "/people/robespierre.jpg", archetypes: [{ name: "Rebelde" }, { name: "Governante" }, { name: "Herói" }] },
  { name: "Cleópatra", initials: "CL", hint: "última faraó do Egito", photo: "/people/cleopatra.jpg", archetypes: [{ name: "Amante" }, { name: "Governante" }, { name: "Mago" }] },
  { name: "Casanova", initials: "GC", hint: "o sedutor original", photo: "/people/casanova.jpg", archetypes: [{ name: "Amante" }, { name: "Explorador" }, { name: "Criador" }] },
  { name: "Leonardo da Vinci", initials: "LV", hint: "gênio renascentista", photo: "/people/leonardo-da-vinci.jpg", photoPosition: "52% 32%", archetypes: [{ name: "Criador" }, { name: "Sábio" }, { name: "Mago" }] },
  { name: "Michelangelo", initials: "MI", hint: "escultor e pintor", photo: "/people/michelangelo.jpg", archetypes: [{ name: "Criador" }, { name: "Herói" }, { name: "Sábio" }] },
  { name: "Mark Twain", initials: "MT", hint: "escritor e humorista", photo: "/people/mark-twain.jpg", archetypes: [{ name: "Bobo" }, { name: "Sábio" }, { name: "Criador" }] },
  { name: "Voltaire", initials: "VO", hint: "filósofo iluminista", photo: "/people/voltaire.jpg", archetypes: [{ name: "Bobo" }, { name: "Sábio" }, { name: "Rebelde" }] },
  { name: "Sócrates", initials: "SO", hint: "filósofo grego", photo: "/people/socrates.jpg", archetypes: [{ name: "Sábio" }, { name: "Bobo" }, { name: "Rebelde" }] },
  { name: "Confúcio", initials: "CF", hint: "sábio chinês", photo: "/people/confucio.jpg", archetypes: [{ name: "Sábio" }, { name: "Governante" }, { name: "Cuidador" }] },
  { name: "Nikola Tesla", initials: "NT", hint: "inventor visionário", photo: "/people/nikola-tesla.jpeg", archetypes: [{ name: "Mago" }, { name: "Criador" }, { name: "Sábio" }] },
  { name: "Nostradamus", initials: "NO", hint: "profeta e astrólogo", photo: "/people/nostradamus.jpg", archetypes: [{ name: "Mago" }, { name: "Sábio" }, { name: "Criador" }] },
  { name: "Júlio César", initials: "JC", hint: "imperador romano", photo: "/people/julio-cesar.jpg", archetypes: [{ name: "Governante" }, { name: "Herói" }, { name: "Rebelde" }] },
  { name: "Elizabeth I", initials: "EI", hint: "rainha da Era de Ouro", photo: "/people/elizabeth-i.jpg", archetypes: [{ name: "Governante" }, { name: "Sábio" }, { name: "Herói" }] },
];
