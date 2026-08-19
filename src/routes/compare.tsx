import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { DATA_DISCLAIMER, RACKETS, getRacket, racketName } from "@/data/rackets";
import { compareForPlayer } from "@/lib/engine";
import { STYLE_LABELS, useStoredProfile } from "@/lib/profile";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Rackets — side-by-side specs | RacketIQ" },
      {
        name: "description",
        content: "Compare up to three tennis rackets spec by spec and see which one fits your playing profile best.",
      },
      { property: "og:title", content: "Compare Rackets — RacketIQ" },
      { property: "og:description", content: "Side-by-side racket specifications and a personalized verdict." },
    ],
  }),
  component: Compare,
});

const ROWS = [
  ["Head size", (r: (typeof RACKETS)[number]) => `${r.head_size} sq in`],
  ["Weight", (r: (typeof RACKETS)[number]) => `${r.weight} g`],
  ["Balance", (r: (typeof RACKETS)[number]) => `${r.balance} cm`],
  ["Swingweight", (r: (typeof RACKETS)[number]) => `${r.swingweight}`],
  ["String pattern", (r: (typeof RACKETS)[number]) => r.string_pattern],
  ["Beam", (r: (typeof RACKETS)[number]) => `${r.beam} mm`],
  ["Stiffness", (r: (typeof RACKETS)[number]) => `${r.stiffness} RA`],
  ["Power", (r: (typeof RACKETS)[number]) => `${r.power_score}/10`],
  ["Control", (r: (typeof RACKETS)[number]) => `${r.control_score}/10`],
  ["Spin", (r: (typeof RACKETS)[number]) => `${r.spin_score}/10`],
  ["Stability", (r: (typeof RACKETS)[number]) => `${r.stability_score}/10`],
  ["Maneuverability", (r: (typeof RACKETS)[number]) => `${r.maneuverability_score}/10`],
  [
    "Recommended player type",
    (r: (typeof RACKETS)[number]) => r.recommended_player_types.map((t) => STYLE_LABELS[t]).join(", "),
  ],
] as const;

function Compare() {
  const { profile } = useStoredProfile();
  const [ids, setIds] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const selected = ids.map((id) => getRacket(id)!).filter(Boolean);
  const options = useMemo(() => {
    const term = q.trim().toLowerCase();
    return RACKETS.filter((r) => !ids.includes(r.id) && (!term || racketName(r).toLowerCase().includes(term))).slice(
      0,
      8,
    );
  }, [q, ids]);

  const verdict = useMemo(
    () => (profile && profile.level && selected.length >= 2 ? compareForPlayer(profile, selected) : null),
    [profile, selected],
  );

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Head to head</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">Compare up to 3 rackets</h1>

          <div className="mt-8 flex flex-wrap gap-2">
            {selected.map((r) => (
              <span key={r.id} className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
                {racketName(r)}
                <button type="button" onClick={() => setIds(ids.filter((x) => x !== r.id))} aria-label="Remove">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          {ids.length < 3 && (
            <div className="panel mt-6 p-6">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a racket to add…" className="h-11" />
              <div className="mt-4 flex flex-wrap gap-2">
                {options.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setIds([...ids, r.id])}
                    className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    + {racketName(r)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected.length > 0 && (
            <div className="panel mt-10 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left text-muted-foreground">Spec</th>
                    {selected.map((r) => (
                      <th key={r.id} className="text-display p-4 text-left text-base font-extrabold">
                        {racketName(r)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([label, fn]) => (
                    <tr key={label} className="border-b border-border/60">
                      <td className="p-4 text-muted-foreground">{label}</td>
                      {selected.map((r) => (
                        <td key={r.id} className="p-4 font-medium">
                          {fn(r)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <section className="mt-12">
            <h2 className="text-display text-3xl font-extrabold">Which one is better for YOU?</h2>
            <div className="panel mt-5 p-6">
              {!profile?.level ? (
                <p className="text-muted-foreground">
                  Complete the questionnaire first and RacketIQ will judge these frames against your own profile.
                </p>
              ) : selected.length < 2 ? (
                <p className="text-muted-foreground">Add at least two rackets to see a personalized verdict.</p>
              ) : (
                verdict && (
                  <div className="space-y-4">
                    <p className="text-lg">
                      Best fit for your profile:{" "}
                      <span className="text-display font-extrabold text-primary">
                        {racketName(verdict.best.racket)} ({verdict.best.overall}%)
                      </span>
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {verdict.lines.map((l) => (
                        <li key={l} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {l}
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {verdict.best.reasons.slice(0, 3).map((r) => (
                        <li key={r} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </section>

          <p className="mt-10 text-xs text-muted-foreground">{DATA_DISCLAIMER}</p>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
