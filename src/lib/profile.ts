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
  level: string;
  frequency: string;
  style: PlayerType | "";
  forehand: "flat" | "moderate" | "heavy" | "";
  backhand: "one" | "two" | "";
  spin: number;
  control: number;
  power: number;
  stability: number;
  maneuverability: number;
  headSize: "95" | "98" | "100" | "102+" | "any" | "";
  weight: "u300" | "300-305" | "305-310" | "310+" | "any" | "";
  pattern: "16x19" | "18x20" | "any" | "";
  currentRacketId: string;
  likes: string;
  dislikes: string;
  improvements: Improvement[];
}

export const emptyProfile: PlayerProfile = {
  level: "",
  frequency: "",
  style: "",
  forehand: "",
  backhand: "",
  spin: 5,
  control: 5,
  power: 5,
  stability: 5,
  maneuverability: 5,
  headSize: "",
  weight: "",
  pattern: "",
  currentRacketId: "",
  likes: "",
  dislikes: "",
  improvements: [],
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
