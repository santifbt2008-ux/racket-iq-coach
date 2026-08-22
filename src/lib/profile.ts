import { useEffect, useState } from "react";
import type { PlayerType } from "@/data/rackets";

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
  pattern: "16x19" | "18x20" | "any" | "";
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
  ["u13", "Under 13"],
  ["13-17", "13–17"],
  ["18-30", "18–30"],
  ["31-50", "31–50"],
  ["50+", "50+"],
];

export const TRAINING_FREQUENCY_OPTIONS: [PlayerProfile["trainingFrequency"], string][] = [
  ["none", "No formal training"],
  ["1-2", "1–2 sessions/week"],
  ["3-4", "3–4 sessions/week"],
  ["5+", "5+ sessions/week"],
];

export const GRIP_SIZE_OPTIONS: [PlayerProfile["gripSize"], string][] = [
  ["4", '4 (4")'],
  ["4_1_8", '4⅛"'],
  ["4_1_4", '4¼"'],
  ["4_3_8", '4⅜"'],
  ["4_1_2", '4½"'],
  ["unsure", "Not sure"],
];

export const BALANCE_OPTIONS: [PlayerProfile["balance"], string][] = [
  ["head-light", "Head-light (maneuverable)"],
  ["even", "Even balance"],
  ["head-heavy", "Head-heavy (more power/stability)"],
  ["any", "No preference"],
];

export const BUDGET_OPTIONS: [PlayerProfile["budget"], string][] = [
  ["u150", "Under $150"],
  ["150-250", "$150–$250"],
  ["250-350", "$250–$350"],
  ["350+", "$350+"],
  ["any", "No strict budget"],
];

export const LEVEL_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Tournament Player",
  "UTR 4–6",
  "UTR 6–8",
  "UTR 8–10",
  "UTR 10+",
];

export const IMPROVEMENT_LABELS: Record<Improvement, string> = {
  power: "More power",
  control: "More control",
  spin: "More spin",
  sweetspot: "Bigger sweet spot",
  stability: "More stability",
  maneuverability: "Better maneuverability",
  comfort: "More comfort",
  serve: "Better serve",
  feel: "Better feel",
};

export const STYLE_LABELS: Record<PlayerType, string> = {
  "aggressive-baseliner": "Aggressive baseliner",
  "all-court": "All-court player",
  counterpuncher: "Counterpuncher",
  "serve-volley": "Serve & volley",
  defensive: "Defensive player",
};

export const LIKE_LABELS: Record<Improvement, string> = {
  power: "Its power",
  control: "Its control / precision",
  spin: "The spin it generates",
  sweetspot: "The sweet spot size",
  stability: "How stable it feels",
  maneuverability: "How fast it swings",
  comfort: "Comfort on the arm",
  serve: "How it serves",
  feel: "The feel / touch",
};

export const DISLIKE_LABELS: Record<Improvement, string> = {
  power: "Not enough power",
  control: "Too little control — balls fly long",
  spin: "Can't generate enough spin",
  sweetspot: "Sweet spot feels too small",
  stability: "Gets pushed around by pace",
  maneuverability: "Too slow / heavy to swing",
  comfort: "Harsh or uncomfortable on the arm",
  serve: "Serve lacks pace or bite",
  feel: "Feels muted or boardy",
};
