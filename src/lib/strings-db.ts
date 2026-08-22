/**
 * String knowledge base — CATEGORY level only.
 *
 * We deliberately do NOT store per-product string specs, because we don't have
 * a verified string product database. Everything below describes how a category
 * of string behaves, which is generally accepted playing characteristics, and is
 * labelled as such in the UI. No product-specific numbers are invented.
 */

export interface StringCategory {
  id: string;
  name: string;
  summary: string;
  power: number; // 1-10, category-level generalisation
  control: number;
  spin: number;
  comfort: number;
  durability: number;
  tension: string; // typical tension window, lbs
  bestFor: string;
  examples: string;
}

export const STRING_CATEGORIES: StringCategory[] = [
  {
    id: "poly",
    name: "Poliéster (monofilamento)",
    summary:
      "Cuerda rígida y de baja elasticidad. Mantiene la pelota dentro de la cancha cuando pegas fuerte y muerde bien para topspin.",
    power: 3,
    control: 9,
    spin: 9,
    comfort: 3,
    durability: 8,
    tension: "44–52 lbs",
    bestFor: "Swing largo y rápido, jugadores que sacan bolas largas con cuerdas suaves.",
    examples: "Categoría: poliéster liso o con perfil (shaped).",
  },
  {
    id: "poly-soft",
    name: "Poliéster suave / co-poly de última generación",
    summary:
      "Versión más elástica del poliéster: conserva control pero es menos dura con el brazo. Pierde tensión más rápido.",
    power: 4,
    control: 8,
    spin: 8,
    comfort: 5,
    durability: 6,
    tension: "42–50 lbs",
    bestFor: "Quien quiere control de poliéster con algo de sensibilidad en el brazo.",
    examples: "Categoría: co-poliéster suave.",
  },
  {
    id: "multi",
    name: "Multifilamento",
    summary:
      "Miles de microfibras: mucha elasticidad, potencia y comodidad, con menos control en swings muy rápidos.",
    power: 8,
    control: 5,
    spin: 5,
    comfort: 9,
    durability: 4,
    tension: "50–58 lbs",
    bestFor: "Swing corto o medio, brazos sensibles, jugadores que buscan profundidad gratis.",
    examples: "Categoría: multifilamento.",
  },
  {
    id: "synthetic",
    name: "Sintética (synthetic gut)",
    summary: "Opción equilibrada y económica: rendimiento medio en todo, sin destacar en nada.",
    power: 6,
    control: 6,
    spin: 5,
    comfort: 6,
    durability: 5,
    tension: "50–58 lbs",
    bestFor: "Principiantes e intermedios que reencuerdan poco y quieren bajo costo.",
    examples: "Categoría: nylon sintético.",
  },
  {
    id: "natural-gut",
    name: "Tripa natural",
    summary:
      "La más elástica y cómoda, mantiene tensión muy bien, pero es cara y sensible a la humedad.",
    power: 9,
    control: 7,
    spin: 6,
    comfort: 10,
    durability: 4,
    tension: "50–58 lbs",
    bestFor: "Brazos delicados y jugadores avanzados que buscan máxima sensación.",
    examples: "Categoría: tripa natural (normalmente en híbrido).",
  },
  {
    id: "hybrid-poly-multi",
    name: "Híbrido: poliéster en verticales / multifilamento en horizontales",
    summary:
      "Control y efecto de las verticales de poliéster con más comodidad y potencia en las horizontales.",
    power: 6,
    control: 7,
    spin: 8,
    comfort: 6,
    durability: 6,
    tension: "Verticales 46–52 / horizontales 48–54 lbs",
    bestFor: "Jugadores que rompen cuerdas y no toleran un encordado full poly.",
    examples: "Categoría: híbrido poli/multi.",
  },
  {
    id: "hybrid-gut-poly",
    name: "Híbrido: tripa natural / poliéster",
    summary: "Sensación y potencia de la tripa con la mordida y el control del poliéster.",
    power: 8,
    control: 7,
    spin: 7,
    comfort: 8,
    durability: 5,
    tension: "Verticales 50–55 / horizontales 46–52 lbs",
    bestFor: "Nivel avanzado/competitivo con presupuesto para reencordar seguido.",
    examples: "Categoría: híbrido tripa/poli.",
  },
];

export const STRINGS_DISCLAIMER =
  "Las características de cuerda son generalizaciones por categoría (no especificaciones de un producto concreto). Aún no tenemos una base de datos verificada de modelos de cuerda.";

export function getStringCategory(id: string) {
  return STRING_CATEGORIES.find((c) => c.id === id) ?? null;
}

export const GAUGE_OPTIONS = [
  { value: "1.20", label: "1.20 mm (17L) — más efecto, menos durabilidad" },
  { value: "1.25", label: "1.25 mm (16L) — equilibrio habitual" },
  { value: "1.30", label: "1.30 mm (16) — más durabilidad y algo más de potencia" },
];
