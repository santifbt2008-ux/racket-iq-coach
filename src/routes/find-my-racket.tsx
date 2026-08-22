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
  AGE_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
  GRIP_SIZE_OPTIONS,
  BALANCE_OPTIONS,
  BUDGET_OPTIONS,
  type Improvement,
  type PlayerProfile,
} from "@/lib/profile";

export const Route = createFileRoute("/find-my-racket")({
  head: () => ({
    meta: [
      { title: "Cuestionario de Raquetas — RacketIQ" },
      {
        name: "description",
        content:
          "Responde 10 pasos rápidos sobre tu nivel, estilo y preferencias para obtener tu recomendación RacketIQ.",
      },
      { property: "og:title", content: "Cuestionario de Raquetas — RacketIQ" },
      {
        property: "og:description",
        content: "Crea tu perfil de juego y obtén una configuración de raqueta personalizada.",
      },
    ],
  }),
  component: Questionnaire,
});

const TOTAL = 13;

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
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? 5)}
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>No importante</span>
        <span>Esencial</span>
      </div>
    </div>
  );
}

/** Tap items in the order that matters most; tapping again removes and re-numbers. */
function RankPicker({
  labels,
  value,
  onChange,
}: {
  labels: Record<Improvement, string>;
  value: Improvement[];
  onChange: (v: Improvement[]) => void;
}) {
  const toggle = (k: Improvement) => {
    if (value.includes(k)) onChange(value.filter((x) => x !== k));
    else onChange([...value, k]);
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(labels) as Improvement[]).map((k) => {
        const rank = value.indexOf(k);
        const selected = rank !== -1;
        return (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-base font-medium transition-all ${
              selected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {selected ? rank + 1 : ""}
            </span>
            {labels[k]}
          </button>
        );
      })}
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
    "Perfil del jugador",
    "Estilo de juego",
    "Golpes",
    "Efecto y control",
    "Potencia, estabilidad y velocidad",
    "¿Qué es lo más importante?",
    "Tamaño de cabeza y balance",
    "Peso, patrón y grip",
    "Tu raqueta actual",
    "Detalles de la configuración",
    "Lo que te gusta y no te gusta",
    "¿Qué debería mejorar?",
    "Presupuesto",
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="eyebrow">
                Paso {step + 1} de {TOTAL}
              </p>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
              </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              />
            </div>

            <h1 className="text-display mt-8 text-3xl font-extrabold sm:text-4xl">
              {stepTitles[step]}
            </h1>

            <div className="mt-8 space-y-8">
              {step === 0 && (
                <>
                  <Field label="Edad">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {AGE_OPTIONS.map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.age === v}
                          onClick={() => set("age", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="¿Cuál es tu nivel de tenis?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {LEVEL_OPTIONS.map((l) => (
                        <OptionButton
                          key={l}
                          selected={profile.level === l}
                          onClick={() => set("level", l)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="Calificación UTR actual (opcional, si la conoces)">
                    <Input
                      value={profile.utr}
                      onChange={(e) => set("utr", e.target.value)}
                      placeholder="ej. 7.2"
                      className="h-12 max-w-xs"
                    />
                  </Field>
                  <Field label="¿Con qué frecuencia juegas partidos/sets de práctica?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        "1–2 veces/semana",
                        "3–4 veces/semana",
                        "5+ veces/semana",
                        "Entrenamiento competitivo",
                      ].map((f) => (
                        <OptionButton
                          key={f}
                          selected={profile.frequency === f}
                          onClick={() => set("frequency", f)}
                        >
                          {f}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="¿Con qué frecuencia entrenas (clases, ejercicios, sesiones de peloteo)?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {TRAINING_FREQUENCY_OPTIONS.map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.trainingFrequency === v}
                          onClick={() => set("trainingFrequency", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 1 && (
                <Field label="¿Qué describe mejor tu juego? (selecciona todas las que apliquen)">
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
                  <Field label="¿Cómo describirías tu derecha?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["flat", "Plana"],
                          ["moderate", "Efecto moderado"],
                          ["heavy", "Efecto pesado"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.forehand === v}
                          onClick={() => set("forehand", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="¿Qué tipo de revés usas?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["one", "A una mano"],
                          ["two", "A dos manos"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.backhand === v}
                          onClick={() => set("backhand", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="¿Qué tan rápido es tu swing?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["slow", "Lento / compacto"],
                          ["moderate", "Moderado"],
                          ["fast", "Rápido"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.swingSpeed === v}
                          onClick={() => set("swingSpeed", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="¿Qué tan largo es tu swing?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["compact", "Compacto / corto"],
                          ["medium", "Medio"],
                          ["long", "Largo / con bucle completo"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.swingLength === v}
                          onClick={() => set("swingLength", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="¿Dónde sueles hacer contacto con la pelota?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["early", "Temprano / al subir"],
                          ["on-time", "Justo en el punto más alto del bote"],
                          ["late", "Un poco tarde / profundo"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.contactPoint === v}
                          onClick={() => set("contactPoint", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <SliderRow
                    label="¿Qué tan importante es el efecto?"
                    value={profile.spin}
                    onChange={(v) => set("spin", v)}
                  />
                  <SliderRow
                    label="¿Cuánto topspin sueles imprimir a tus golpes?"
                    value={profile.topspinLevel}
                    onChange={(v) => set("topspinLevel", v)}
                  />
                  <SliderRow
                    label="¿Qué tan importante es el control?"
                    value={profile.control}
                    onChange={(v) => set("control", v)}
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <SliderRow
                    label="¿Cuánta potencia quieres?"
                    value={profile.power}
                    onChange={(v) => set("power", v)}
                  />
                  <SliderRow
                    label="¿Qué tan importante es la estabilidad?"
                    value={profile.stability}
                    onChange={(v) => set("stability", v)}
                  />
                  <SliderRow
                    label="¿Qué tan importante es la maniobrabilidad?"
                    value={profile.maneuverability}
                    onChange={(v) => set("maneuverability", v)}
                  />
                </>
              )}

              {step === 5 && (
                <Field label="Toca tus prioridades en orden — la más importante primero (opcional, pero afina tu resultado)">
                  <RankPicker
                    labels={IMPROVEMENT_LABELS}
                    value={profile.priorityRanking}
                    onChange={(v) => set("priorityRanking", v)}
                  />
                </Field>
              )}

              {step === 6 && (
                <>
                  <Field label="Tamaño de cabeza preferido (pulg. cuadradas)">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["95", "95"],
                          ["98", "98"],
                          ["100", "100"],
                          ["102+", "102+"],
                          ["any", "Sin preferencia"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.headSize === v}
                          onClick={() => set("headSize", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="Balance preferido">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {BALANCE_OPTIONS.map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.balance === v}
                          onClick={() => set("balance", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 7 && (
                <>
                  <Field label="Peso preferido (encordada)">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["u300", "Menos de 300g"],
                          ["300-305", "300–305g"],
                          ["305-310", "305–310g"],
                          ["310+", "310g+"],
                          ["any", "Sin preferencia"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.weight === v}
                          onClick={() => set("weight", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="Patrón de cuerdas preferido">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["16x19", "16x19"],
                          ["18x20", "18x20"],
                          ["any", "Sin preferencia"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.pattern === v}
                          onClick={() => set("pattern", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="Tamaño de grip (revisa el capuchón de tu raqueta actual si no estás seguro)">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {GRIP_SIZE_OPTIONS.map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.gripSize === v}
                          onClick={() => set("gripSize", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 8 && (
                <Field label="¿Con qué raqueta juegas actualmente?">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Busca en la base de datos de raquetas…"
                      className="h-12 pl-9"
                    />
                  </div>
                  <div className="mt-4 grid gap-2">
                    {matches.map((r) => (
                      <OptionButton
                        key={r.id}
                        selected={profile.currentRacketId === r.id}
                        onClick={() =>
                          set("currentRacketId", profile.currentRacketId === r.id ? "" : r.id)
                        }
                      >
                        <span className="font-semibold text-foreground">{racketName(r)}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {r.head_size} pulg² · {r.weight}g · {r.string_pattern}
                        </span>
                      </OptionButton>
                    ))}
                    {!matches.length && (
                      <p className="text-sm text-muted-foreground">Ninguna raqueta coincide con esa búsqueda.</p>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Opcional — omite este paso si tu raqueta no aparece en la lista.
                  </p>
                </Field>
              )}

              {step === 9 && (
                <>
                  <Field label="Tu configuración actual (opcional — llena lo que sepas)">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <LabeledInput
                        label="Peso actual de la raqueta (g)"
                        value={profile.currentRacketWeight}
                        onChange={(v) => set("currentRacketWeight", v)}
                        placeholder="ej. 305"
                      />
                      <LabeledInput
                        label="Tamaño de cabeza actual (pulg²)"
                        value={profile.currentRacketHeadSize}
                        onChange={(v) => set("currentRacketHeadSize", v)}
                        placeholder="ej. 100"
                      />
                      <LabeledInput
                        label="Configuración de cuerdas actual"
                        value={profile.currentStringSetup}
                        onChange={(v) => set("currentStringSetup", v)}
                        placeholder="ej. Verticales de poliéster, horizontales sintéticas"
                      />
                      <LabeledInput
                        label="Tensión actual (lbs), si la conoces"
                        value={profile.currentTension}
                        onChange={(v) => set("currentTension", v)}
                        placeholder="ej. 50"
                      />
                    </div>
                  </Field>
                  <Field label="¿Qué tan sensible es tu brazo/codo/hombro a un marco o configuración más rígida?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["none", "Nada sensible"],
                          ["mild", "Algo sensible"],
                          ["significant", "Muy sensible (p. ej. historial de codo de tenista)"],
                        ] as const
                      ).map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.comfortSensitivity === v}
                          onClick={() => set("comfortSensitivity", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 10 && (
                <>
                  <Field label="¿Qué te gusta de tu raqueta actual? (selecciona todas las que apliquen)">
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
                  <Field label="¿Qué no te gusta de tu raqueta actual? (selecciona todas las que apliquen)">
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

              {step === 11 && (
                <Field label="¿Qué quieres que mejore tu próxima raqueta? (selecciona todas las que apliquen)">
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

              {step === 12 && (
                <>
                  <Field label="¿Cuál es tu presupuesto para una raqueta?">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {BUDGET_OPTIONS.map(([v, l]) => (
                        <OptionButton
                          key={v}
                          selected={profile.budget === v}
                          onClick={() => set("budget", v)}
                        >
                          {l}
                        </OptionButton>
                      ))}
                    </div>
                  </Field>
                  <Field label="Si una raqueta más cara se ajusta notablemente mejor, ¿considerarías pagar más?">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <OptionButton
                        selected={profile.payMoreForFit}
                        onClick={() => set("payMoreForFit", true)}
                      >
                        Sí, el ajuste importa más que el precio
                      </OptionButton>
                      <OptionButton
                        selected={!profile.payMoreForFit}
                        onClick={() => set("payMoreForFit", false)}
                      >
                        No, prefiero mantenerme dentro del presupuesto
                      </OptionButton>
                    </div>
                  </Field>
                </>
              )}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {step === TOTAL - 1 ? "Analizar mi juego" : "Siguiente"} <ArrowRight className="h-4 w-4" />
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

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11"
      />
    </label>
  );
}
