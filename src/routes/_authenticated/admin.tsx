import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { formatMXN } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import {
  KEY_SPECS,
  POWER_LEVELS,
  RACKET_TYPES,
  STRING_PATTERNS,
  SWING_SPEEDS,
  racketFullName,
  slugify,
  type RacketRow,
} from "@/lib/racket-db";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Catalog admin — manage rackets | RacketIQ" },
      { name: "description", content: "Add, edit, delete and import tennis racket records in the RacketIQ catalog." },
      { property: "og:title", content: "Catalog admin — RacketIQ" },
      { property: "og:description", content: "Manage the RacketIQ tennis racket database." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Draft = Partial<RacketRow> & { brand: string; model: string };

const EMPTY: Draft = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  racket_type: "Tweener",
  head_size: 100,
  length: 27,
  weight: 300,
  balance: 32,
  swingweight: 315,
  stiffness: 65,
  beam_width: "",
  string_pattern: "16x19",
  composition: "Graphite composite",
  power_level: "Medium",
  swing_speed: "Moderate",
  stroke_style: "all-court",
  price: 249,
  image_url: "",
  description: "",
  product_url: "",
  is_current: true,
};

const NUMERIC = new Set([
  "year",
  "head_size",
  "length",
  "weight",
  "balance",
  "swingweight",
  "stiffness",
  "price",
  "head_size_cm2",
  "weight_unstrung",
  "weight_strung",
  "balance_points",
  "mains",
  "crosses",
]);

/** Campos extendidos de ficha técnica y trazabilidad de fuente. */
const EXTRA_FIELDS = [
  "generation",
  "head_size_cm2",
  "weight_unstrung",
  "weight_strung",
  "balance_points",
  "mains",
  "crosses",
  "grip_sizes",
  "recommended_tension",
  "control_level",
  "spin_level",
  "comfort_level",
  "maneuverability",
  "recommended_player_level",
  "recommended_play_style",
  "manufacturer_url",
  "source_url",
] as const;

const EXTRA_LABELS: Record<(typeof EXTRA_FIELDS)[number], string> = {
  generation: "Generación (v9, 2026…)",
  head_size_cm2: "Cabeza (cm²)",
  weight_unstrung: "Peso sin encordar (g)",
  weight_strung: "Peso encordado (g)",
  balance_points: "Balance (puntos)",
  mains: "Verticales (mains)",
  crosses: "Horizontales (crosses)",
  grip_sizes: "Medidas de grip",
  recommended_tension: "Tensión recomendada",
  control_level: "Nivel de control",
  spin_level: "Nivel de spin",
  comfort_level: "Nivel de comodidad",
  maneuverability: "Maniobrabilidad",
  recommended_player_level: "Nivel de jugador recomendado",
  recommended_play_style: "Estilo de juego recomendado",
  manufacturer_url: "URL del fabricante",
  source_url: "URL de la fuente",
};

function toPayload(draft: Draft) {
  const payload: Record<string, unknown> = {
    slug: draft.slug || slugify(`${draft.brand}-${draft.model}`),
    brand: draft.brand.trim(),
    model: draft.model.trim(),
    is_current: draft.is_current ?? true,
  };
  for (const key of [
    "year",
    "racket_type",
    "head_size",
    "length",
    "weight",
    "balance",
    "swingweight",
    "stiffness",
    "beam_width",
    "string_pattern",
    "composition",
    "power_level",
    "swing_speed",
    "stroke_style",
    "price",
    "image_url",
    "description",
    "product_url",
    ...EXTRA_FIELDS,
  ] as const) {
    const value = draft[key as keyof Draft];
    payload[key] = value === "" || value === undefined ? null : value;
  }
  payload["status"] = draft.is_current ?? true ? "current" : "discontinued";
  payload["source_verified"] = draft.source_verified ?? false;
  payload["incomplete_data"] = KEY_SPECS.some((k) => {
    const v = payload[k] ?? (draft as Record<string, unknown>)[k];
    return v === null || v === undefined || v === "";
  });
  return payload;
}

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return setIsAdmin(false);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(Boolean(data));
    })();
  }, []);

  const { data: rackets = [], isLoading } = useQuery({
    queryKey: ["admin-rackets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rackets")
        .select("*")
        .order("brand", { ascending: true })
        .order("model", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as RacketRow[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-rackets"] });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = toPayload(d);
      if (d.id) {
        const { error } = await supabase.from("rackets").update(payload as never).eq("id", d.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("rackets").insert(payload as never);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Raqueta guardada");
      setDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rackets").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Raqueta eliminada");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkImport = useMutation({
    mutationFn: async (text: string) => {
      const parsed = JSON.parse(text);
      const rows = (Array.isArray(parsed) ? parsed : [parsed]) as Draft[];
      const payloads = rows.map((r) => toPayload({ ...EMPTY, ...r }));
      const { error } = await supabase.from("rackets").upsert(payloads as never, { onConflict: "slug" });
      if (error) throw new Error(error.message);
      return payloads.length;
    },
    onSuccess: (count) => {
      toast.success(`Se importaron ${count} raquetas`);
      setImportText("");
      setShowImport(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Error al importar: ${e.message}`),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? rackets.filter((r) => racketFullName(r).toLowerCase().includes(term)) : rackets;
  }, [rackets, search]);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth" });
  };

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Administración</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold">Gestor del catálogo de raquetas</h1>
              <p className="mt-2 text-sm text-muted-foreground">{rackets.length} registros en la base de datos.</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/audit"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
              >
                Auditoría
              </Link>
              <button
                type="button"
                onClick={() => setShowImport((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
              >
                <Upload className="h-4 w-4" /> Importar
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...EMPTY })}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Nueva raqueta
              </button>
              <button type="button" onClick={signOut} className="text-sm text-muted-foreground underline">
                Cerrar sesión
              </button>
            </div>
          </div>

          {isAdmin === false && (
            <div className="panel mt-8 p-6 text-sm text-muted-foreground">
              Tu cuenta tiene la sesión iniciada pero no cuenta con el rol de <strong className="text-foreground">admin</strong>, por lo que
              los cambios que guardes serán rechazados. Pide a un propietario que otorgue acceso de administrador a tu cuenta.
            </div>
          )}

          {showImport && (
            <div className="panel mt-8 space-y-3 p-6">
              <h2 className="font-bold">Importación masiva</h2>
              <p className="text-sm text-muted-foreground">
                Pega un arreglo JSON de objetos de raqueta (los campos coinciden con las columnas de la tabla). Las filas existentes con el mismo slug
                se actualizarán. Importa solo datos que tengas derecho a usar.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                placeholder='[{"brand":"Yonex","model":"EZONE 98","head_size":98,"weight":305}]'
                className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs"
              />
              <button
                type="button"
                disabled={bulkImport.isPending || !importText.trim()}
                onClick={() => bulkImport.mutate(importText)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {bulkImport.isPending ? "Importando…" : "Importar registros"}
              </button>
            </div>
          )}

          {draft && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(draft);
              }}
              className="panel mt-8 space-y-4 p-6"
            >
              <h2 className="font-bold">{draft.id ? "Editar raqueta" : "Nueva raqueta"}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["brand", "Marca"],
                    ["model", "Modelo"],
                    ["year", "Año"],
                    ["head_size", "Tamaño de cabeza (pulg²)"],
                    ["length", "Longitud (pulg)"],
                    ["weight", "Peso (g)"],
                    ["balance", "Balance (cm)"],
                    ["swingweight", "Swingweight"],
                    ["stiffness", "Rigidez (RA)"],
                    ["beam_width", "Ancho de perfil"],
                    ["composition", "Composición"],
                    ["stroke_style", "Estilo de golpe"],
                    ["price", "Precio (USD de referencia)"],
                    ["image_url", "URL de imagen (solo con licencia)"],
                    ["product_url", "URL del producto"],
                    ...EXTRA_FIELDS.map((f) => [f, EXTRA_LABELS[f]] as const),
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label htmlFor={key} className="mb-1.5 block text-xs text-muted-foreground">
                      {label}
                    </label>
                    <Input
                      id={key}
                      type={NUMERIC.has(key) ? "number" : "text"}
                      step="any"
                      value={(draft[key] as string | number | null) ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [key]: NUMERIC.has(key)
                            ? e.target.value === ""
                              ? null
                              : Number(e.target.value)
                            : e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
                {(
                  [
                    ["racket_type", RACKET_TYPES],
                    ["string_pattern", STRING_PATTERNS],
                    ["power_level", POWER_LEVELS],
                    ["swing_speed", SWING_SPEEDS],
                  ] as const
                ).map(([key, options]) => (
                  <div key={key}>
                    <label htmlFor={key} className="mb-1.5 block text-xs capitalize text-muted-foreground">
                      {key.replace("_", " ")}
                    </label>
                    <select
                      id={key}
                      value={(draft[key] as string) ?? ""}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    >
                      {options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.is_current ?? true}
                    onChange={(e) => setDraft({ ...draft, is_current: e.target.checked })}
                  />
                  Modelo actual
                </label>
              </div>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-xs text-muted-foreground">
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={save.isPending}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {save.isPending ? "Guardando…" : "Guardar raqueta"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="mt-10">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar registros…"
              className="h-11 max-w-sm"
              aria-label="Filtrar registros de raquetas"
            />
            <div className="panel mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="p-4">Raqueta</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Cabeza</th>
                    <th className="p-4">Peso</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td className="p-4 text-muted-foreground" colSpan={7}>
                        Cargando…
                      </td>
                    </tr>
                  )}
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="p-4">
                        <Link to="/catalog/$slug" params={{ slug: r.slug }} className="font-semibold hover:underline">
                          {racketFullName(r)}
                        </Link>
                      </td>
                      <td className="p-4 text-muted-foreground">{r.racket_type}</td>
                      <td className="p-4 text-muted-foreground">{r.head_size}</td>
                      <td className="p-4 text-muted-foreground">{r.weight}g</td>
                      <td className="p-4 text-muted-foreground">{r.price != null ? formatMXN(r.price) : "—"}</td>
                      <td className="p-4 text-muted-foreground">{r.is_current ? "Actual" : "Anterior"}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            aria-label={`Editar ${racketFullName(r)}`}
                            onClick={() => setDraft({ ...r })}
                            className="rounded-full border border-border p-2 hover:bg-secondary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Eliminar ${racketFullName(r)}`}
                            onClick={() => {
                              if (confirm(`¿Eliminar ${racketFullName(r)}?`)) remove.mutate(r.id);
                            }}
                            className="rounded-full border border-border p-2 text-destructive hover:bg-secondary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
