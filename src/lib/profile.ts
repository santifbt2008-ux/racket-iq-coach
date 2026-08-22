import { useEffect, useState } from "react";
import type { PlayerType } from "@/lib/racket-engine";

export type Improvement =
  | "power"
  | "control"
  | "spin"
  | "sweetspot"
  | "stability"
  | "maneuverability"
  | "comfort"
  | "serve"
  | "feel";

export interface PlayerProfile {
  // --- Player information ---
  age: "u13" | "13-17" | "18-30" | "31-50" | "50+" | "";
  level: string;
  utr: string; // optional, free-form (e.g. "7.2") — separate from the level bucket above
  frequency: string; // matches played per week
  trainingFrequency: "none" | "1-2" | "3-4" | "5+" | ""; // practice sessions per week

  // --- Playing style ---
  styles: PlayerType[];
  forehand: "flat" | "moderate" | "heavy" | "";
  backhand: "one" | "two" | "";
  swingSpeed: "slow" | "moderate" | "fast" | "";
  swingLength: "compact" | "medium" | "long" | "";
  contactPoint: "early" | "on-time" | "late" | "";
  topspinLevel: number; // 1-10, distinct from the forehand style label above

  // --- Priorities (weighted 1-10 + explicit ranking) ---
  spin: number;
  control: number;
  power: number;
  stability: number;
  maneuverability: number;
  priorityRanking: Improvement[]; // order the player drags/taps into, most important first

  // --- Current racket ---
  currentRacketId: string;
  currentRacketWeight: string; // free text — used when the racket isn't in the DB or specs differ
  currentRacketHeadSize: string;
  currentStringSetup: string;
  currentTension: string;
  likes: Improvement[];
  dislikes: Improvement[];
  improvements: Improvement[];

  // --- Physical / preferences ---
  headSize: "95" | "98" | "100" | "102+" | "any" | "";
  weight: "u300" | "300-305" | "305-310" | "310+" | "any" | "";
  balance: "head-light" | "even" | "head-heavy" | "any" | "";
  pattern: string; // any pattern present in the catalog, or "any"
  gripSize: "4" | "4_1_8" | "4_1_4" | "4_3_8" | "4_1_2" | "unsure" | "";
  comfortSensitivity: "none" | "mild" | "significant" | "";

  // --- Budget ---
  budget: "u150" | "150-250" | "250-350" | "350+" | "any" | "";
  payMoreForFit: boolean;
}

export const emptyProfile: PlayerProfile = {
  age: "",
  level: "",
  utr: "",
  frequency: "",
  trainingFrequency: "",

  styles: [],
  forehand: "",
  backhand: "",
  swingSpeed: "",
  swingLength: "",
  contactPoint: "",
  topspinLevel: 5,

  spin: 5,
  control: 5,
  power: 5,
  stability: 5,
  maneuverability: 5,
  priorityRanking: [],

  currentRacketId: "",
  currentRacketWeight: "",
  currentRacketHeadSize: "",
  currentStringSetup: "",
  currentTension: "",
  likes: [],
  dislikes: [],
  improvements: [],

  headSize: "",
  weight: "",
  balance: "",
  pattern: "",
  gripSize: "",
  comfortSensitivity: "",

  budget: "",
  payMoreForFit: false,
};

const KEY = "racketiq.profile";

export function saveProfile(p: PlayerProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(p));
}

export function loadProfile(): PlayerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? ({ ...emptyProfile, ...JSON.parse(raw) } as PlayerProfile) : null;
  } catch {
    return null;
  }
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

/** Reads the stored profile after hydration. `loading` is true on first render. */
export function useStoredProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setProfile(loadProfile());
    setLoading(false);
  }, []);
  return { profile, loading };
}

export const AGE_OPTIONS: [PlayerProfile["age"], string][] = [
  ["u13", "Menos de 13"],
  ["13-17", "13–17"],
  ["18-30", "18–30"],
  ["31-50", "31–50"],
  ["50+", "50+"],
];

export const TRAINING_FREQUENCY_OPTIONS: [PlayerProfile["trainingFrequency"], string][] = [
  ["none", "Sin entrenamiento formal"],
  ["1-2", "1–2 sesiones/semana"],
  ["3-4", "3–4 sesiones/semana"],
  ["5+", "5+ sesiones/semana"],
];

export const GRIP_SIZE_OPTIONS: [PlayerProfile["gripSize"], string][] = [
  ["4", '4 (4")'],
  ["4_1_8", '4⅛"'],
  ["4_1_4", '4¼"'],
  ["4_3_8", '4⅜"'],
  ["4_1_2", '4½"'],
  ["unsure", "No estoy seguro"],
];

export const BALANCE_OPTIONS: [PlayerProfile["balance"], string][] = [
  ["head-light", "Balance en el mango (más maniobrable)"],
  ["even", "Balance equilibrado"],
  ["head-heavy", "Balance en la cabeza (más potencia/estabilidad)"],
  ["any", "Sin preferencia"],
];

export const BUDGET_OPTIONS: [PlayerProfile["budget"], string][] = [
  ["u150", "Menos de $2,800 MXN"],
  ["150-250", "$2,800–$4,600 MXN"],
  ["250-350", "$4,600–$6,500 MXN"],
  ["350+", "Más de $6,500 MXN"],
  ["any", "Sin presupuesto fijo"],
];

export const LEVEL_OPTIONS = [
  "Principiante",
  "Intermedio",
  "Avanzado",
  "Competitivo",
  "Profesional",
];

/** UTR is asked separately from level — a player can have any UTR at any level. */
export const UTR_OPTIONS = [
  "No la conozco",
  "1–2",
  "3–4",
  "5–6",
  "7–8",
  "9–10",
  "11–12",
  "13+",
];

export const IMPROVEMENT_LABELS: Record<Improvement, string> = {
  power: "Más potencia",
  control: "Más control",
  spin: "Más efecto",
  sweetspot: "Punto dulce más grande",
  stability: "Más estabilidad",
  maneuverability: "Mejor maniobrabilidad",
  comfort: "Más comodidad",
  serve: "Mejor saque",
  feel: "Mejor sensación",
};

export const STYLE_LABELS: Record<PlayerType, string> = {
  "aggressive-baseliner": "Jugador de fondo agresivo",
  "all-court": "Jugador todocancha",
  counterpuncher: "Contragolpeador",
  "serve-volley": "Saque y volea",
  defensive: "Jugador defensivo",
};

export const LIKE_LABELS: Record<Improvement, string> = {
  power: "Su potencia",
  control: "Su control / precisión",
  spin: "El efecto que genera",
  sweetspot: "El tamaño del punto dulce",
  stability: "Qué tan estable se siente",
  maneuverability: "Qué tan rápido se mueve",
  comfort: "Comodidad para el brazo",
  serve: "Cómo saca con ella",
  feel: "La sensación / tacto",
};

export const DISLIKE_LABELS: Record<Improvement, string> = {
  power: "No tiene suficiente potencia",
  control: "Muy poco control — las bolas se van largas",
  spin: "No genera suficiente efecto",
  sweetspot: "El punto dulce se siente muy pequeño",
  stability: "Se descontrola con la velocidad de la pelota",
  maneuverability: "Muy lenta / pesada para moverla",
  comfort: "Dura o incómoda para el brazo",
  serve: "Al saque le falta velocidad o mordida",
  feel: "Se siente apagada o sin tacto",
};
