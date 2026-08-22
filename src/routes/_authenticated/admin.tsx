import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
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

const NUMERIC = new Set(["year", "head_size", "length", "weight", "balance", "swingweight", "stiffness", "price"]);

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
  ] as const) {
    const value = draft[key];
    payload[key] = value === "" || value === undefined ? null : value;
  }
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
      toast.success("Racket saved");
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
      toast.success("Racket deleted");
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
      toast.success(`Imported ${count} rackets`);
      setImportText("");
      setShowImport(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Import failed: ${e.message}`),
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
              <p className="eyebrow">Admin</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold">Racket catalog manager</h1>
              <p className="mt-2 text-sm text-muted-foreground">{rackets.length} records in the database.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowImport((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
              >
                <Upload className="h-4 w-4" /> Import
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...EMPTY })}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> New racket
              </button>
              <button type="button" onClick={signOut} className="text-sm text-muted-foreground underline">
                Sign out
              </button>
            </div>
          </div>

          {isAdmin === false && (
            <div className="panel mt-8 p-6 text-sm text-muted-foreground">
              Your account is signed in but does not have the <strong className="text-foreground">admin</strong> role, so
              saving changes will be rejected. Ask an owner to grant your account admin access.
            </div>
          )}

          {showImport && (
            <div className="panel mt-8 space-y-3 p-6">
              <h2 className="font-bold">Bulk import</h2>
              <p className="text-sm text-muted-foreground">
                Paste a JSON array of racket objects (fields match the table columns). Existing rows with the same slug
                are updated. Only import data you have the right to use.
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
                {bulkImport.isPending ? "Importing…" : "Import records"}
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
              <h2 className="font-bold">{draft.id ? "Edit racket" : "New racket"}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["brand", "Brand"],
                    ["model", "Model"],
                    ["year", "Year"],
                    ["head_size", "Head size (sq in)"],
                    ["length", "Length (in)"],
                    ["weight", "Weight (g)"],
                    ["balance", "Balance (cm)"],
                    ["swingweight", "Swingweight"],
                    ["stiffness", "Stiffness (RA)"],
                    ["beam_width", "Beam width"],
                    ["composition", "Composition"],
                    ["stroke_style", "Stroke style"],
                    ["price", "Price (USD)"],
                    ["image_url", "Image URL (licensed only)"],
                    ["product_url", "Product URL"],
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
                  Current model
                </label>
              </div>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-xs text-muted-foreground">
                  Description
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
                  {save.isPending ? "Saving…" : "Save racket"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-10">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter records…"
              className="h-11 max-w-sm"
              aria-label="Filter racket records"
            />
            <div className="panel mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="p-4">Racket</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Head</th>
                    <th className="p-4">Weight</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td className="p-4 text-muted-foreground" colSpan={7}>
                        Loading…
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
                      <td className="p-4 text-muted-foreground">{r.price != null ? `$${r.price}` : "—"}</td>
                      <td className="p-4 text-muted-foreground">{r.is_current ? "Current" : "Older"}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            aria-label={`Edit ${racketFullName(r)}`}
                            onClick={() => setDraft({ ...r })}
                            className="rounded-full border border-border p-2 hover:bg-secondary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${racketFullName(r)}`}
                            onClick={() => {
                              if (confirm(`Delete ${racketFullName(r)}?`)) remove.mutate(r.id);
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
