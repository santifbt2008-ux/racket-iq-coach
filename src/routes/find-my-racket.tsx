import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Search } from "lucide-react";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { RACKETS, racketName, type PlayerType } from "@/data/rackets";
import {
  emptyProfile,
  clearProfile,
  loadProfile,
  saveProfile,
  IMPROVEMENT_LABELS,
  LIKE_LABELS,
  DISLIKE_LABELS,
  LEVEL_OPTIONS,
  STYLE_LABELS,
  type Improvement,
  type PlayerProfile,
} from "@/lib/profile";

export const Route = createFileRoute("/find-my-racket")({
  head: () => ({
    meta: [
      { title: "Racket Questionnaire — RacketIQ" },
      {
        name: "description",
        content: "Answer 10 quick steps about your level, style and preferences to get your RacketIQ match.",
      },
      { property: "og:title", content: "Racket Questionnaire — RacketIQ" },
      { property: "og:description", content: "Build your playing profile and get a personalized racket setup." },
    ],
  }),
  component: Questionnaire,
});

const TOTAL = 10;

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-5 py-4 text-left text-base font-medium transition-all ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="panel p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-display text-2xl font-extrabold text-primary">{value}</span>
      </div>
      <Slider min={1} max={10} step={1} value={[value]} onValueChange={(v) => onChange(v[0] ?? 5)} />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Not important</span>
        <span>Essential</span>
      </div>
    </div>
  );
}

function Questionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProfile(profile);
  }, [profile, hydrated]);

  const set = <K extends keyof PlayerProfile>(k: K, v: PlayerProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return RACKETS.slice(0, 6);
    return RACKETS.filter((r) => racketName(r).toLowerCase().includes(q)).slice(0, 8);
  }, [search]);

  const canContinue = (() => {
    switch (step) {
      case 0:
        return !!profile.level && !!profile.frequency;
      case 1:
        return profile.styles.length > 0;
      case 2:
        return !!profile.forehand && !!profile.backhand;
      case 8:
        return true;
      default:
        return true;
    }
  })();

  const next = () => {
    if (step === TOTAL - 1) {
      navigate({ to: "/results" });
      return;
    }
    setStep((s) => Math.min(TOTAL - 1, s + 1));
  };

  const restart = () => {
    clearProfile();
    setProfile(emptyProfile);
    setStep(0);
  };

  const stepTitles = [
    "Player profile",
    "Playing style",
    "Strokes",
    "Spin & control",
    "Power, stability & speed",
    "Head size",
    "Weight & string pattern",
    "Your current racket",
    "Likes & dislikes",
    "What should improve?",
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="eyebrow">
                Step {step + 1} of {TOTAL}
              </p>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              />
            </div>

            <h1 className="text-display mt-8 text-3xl font-extrabold sm:text-4xl">{stepTitles[step]}</h1>

            <div className="mt-8 space-y-8">
              {step === 0 && (
                <>
                  <Field label="What is your tennis level?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {LEVEL_OPTIONS.map((l) => (
                        <OptionButton key={l} selected={profile.level === l} onClick={() => set("level", l)}>
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="How often do you play?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["1–2 times/week", "3–4 times/week", "5+ times/week", "Competitive training"].map((f) => (
                        <OptionButton key={f} selected={profile.frequency === f} onClick={() => set("frequency", f)}>
                          {f}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 1 && (
                <Field label="Which best describes your game? (select all that apply)">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(Object.keys(STYLE_LABELS) as PlayerType[]).map((s) => (
                      <OptionButton
                        key={s}
                        selected={profile.styles.includes(s)}
                        onClick={() =>
                          set(
                            "styles",
                            profile.styles.includes(s)
                              ? profile.styles.filter((x) => x !== s)
                              : [...profile.styles, s],
                          )
                        }
                      >
                        {STYLE_LABELS[s]}
                      </OptionButton>
                    ))}
                  </div>
                </Field>
              )}

              {step === 2 && (
                <>
                  <Field label="How would you describe your forehand?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["flat", "Flat"],
                          ["moderate", "Moderate topspin"],
                          ["heavy", "Heavy topspin"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton key={v} selected={profile.forehand === v} onClick={() => set("forehand", v)}>
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="What type of backhand do you use?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["one", "One-handed"],
                          ["two", "Two-handed"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton key={v} selected={profile.backhand === v} onClick={() => set("backhand", v)}>
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <SliderRow label="How important is spin?" value={profile.spin} onChange={(v) => set("spin", v)} />
                  <SliderRow
                    label="How important is control?"
                    value={profile.control}
                    onChange={(v) => set("control", v)}
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <SliderRow label="How much power do you want?" value={profile.power} onChange={(v) => set("power", v)} />
                  <SliderRow
                    label="How important is stability?"
                    value={profile.stability}
                    onChange={(v) => set("stability", v)}
                  />
                  <SliderRow
                    label="How important is maneuverability?"
                    value={profile.maneuverability}
                    onChange={(v) => set("maneuverability", v)}
                  />
                </>
              )}

              {step === 5 && (
                <Field label="Preferred head size (sq. in.)">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["95", "95"],
                        ["98", "98"],
                        ["100", "100"],
                        ["102+", "102+"],
                        ["any", "No preference"],
                      ] as const
                    ).map(([v, l]) => (
                      <OptionButton key={v} selected={profile.headSize === v} onClick={() => set("headSize", v)}>
                        {l}
                      </OptionButton>
                    ))}
                  </div>
                </Field>
              )}

              {step === 6 && (
                <>
                  <Field label="Preferred weight (strung)">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["u300", "Under 300g"],
                          ["300-305", "300–305g"],
                          ["305-310", "305–310g"],
                          ["310+", "310g+"],
                          ["any", "No preference"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton key={v} selected={profile.weight === v} onClick={() => set("weight", v)}>
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="Preferred string pattern">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["16x19", "16x19"],
                          ["18x20", "18x20"],
                          ["any", "No preference"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton key={v} selected={profile.pattern === v} onClick={() => set("pattern", v)}>
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 7 && (
                <Field label="What do you currently play with?">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search the racket database…"
                      className="h-12 pl-9"
                    />
                  </div>
                  <div className="mt-4 grid gap-2">
                    {matches.map((r) => (
                      <OptionButton
                        key={r.id}
                        selected={profile.currentRacketId === r.id}
                        onClick={() => set("currentRacketId", profile.currentRacketId === r.id ? "" : r.id)}
                      >
                        <span className="font-semibold text-foreground">{racketName(r)}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {r.head_size} sq in · {r.weight}g · {r.string_pattern}
                        </span>
                      </OptionButton>
                    ))}
                    {!matches.length && <p className="text-sm text-muted-foreground">No rackets match that search.</p>}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Optional — skip if your racket isn't listed.</p>
                </Field>
              )}

              {step === 8 && (
                <>
                  <Field label="What do you like about your current racket? (select all that apply)">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(Object.keys(LIKE_LABELS) as Improvement[]).map((k) => (
                        <OptionButton
                          key={k}
                          selected={profile.likes.includes(k)}
                          onClick={() =>
                            set(
                              "likes",
                              profile.likes.includes(k)
                                ? profile.likes.filter((x) => x !== k)
                                : [...profile.likes, k],
                            )
                          }
                        >
                          {LIKE_LABELS[k]}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="What do you dislike about your current racket? (select all that apply)">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(Object.keys(DISLIKE_LABELS) as Improvement[]).map((k) => (
                        <OptionButton
                          key={k}
                          selected={profile.dislikes.includes(k)}
                          onClick={() =>
                            set(
                              "dislikes",
                              profile.dislikes.includes(k)
                                ? profile.dislikes.filter((x) => x !== k)
                                : [...profile.dislikes, k],
                            )
                          }
                        >
                          {DISLIKE_LABELS[k]}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 9 && (
                <Field label="What do you want your next racket to improve? (select all that apply)">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(Object.keys(IMPROVEMENT_LABELS) as Improvement[]).map((imp) => (
                      <OptionButton
                        key={imp}
                        selected={profile.improvements.includes(imp)}
                        onClick={() =>
                          set(
                            "improvements",
                            profile.improvements.includes(imp)
                              ? profile.improvements.filter((i) => i !== imp)
                              : [...profile.improvements, imp],
                          )
                        }
                      >
                        {IMPROVEMENT_LABELS[imp]}
                      </OptionButton>
                    ))}
                  </div>
                </Field>
              )}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {step === TOTAL - 1 ? "Analyze my game" : "Next"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">{label}</h2>
      {children}
    </div>
  );
}
