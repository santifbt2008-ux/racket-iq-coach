import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { RacketRow } from "./racket-db";

const COLUMNS =
  "id, slug, brand, model, year, racket_type, head_size, length, weight, balance, swingweight, stiffness, beam_width, string_pattern, composition, power_level, swing_speed, stroke_style, price, image_url, description, product_url, is_current, created_at, generation, status, head_size_cm2, weight_unstrung, weight_strung, balance_points, mains, crosses, grip_sizes, recommended_tension, control_level, spin_level, comfort_level, maneuverability, recommended_player_level, recommended_play_style, manufacturer_url, source_url, source_verified, incomplete_data, updated_at";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listRackets = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("rackets")
    .select(COLUMNS)
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .returns<RacketRow[]>();
  if (error) throw new Error(error.message);
  return (data ?? []) as RacketRow[];
});

export const getRacketBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("rackets")
      .select(COLUMNS)
      .eq("slug", data.slug)
      .maybeSingle()
      .returns<RacketRow>();
    if (error) throw new Error(error.message);
    return (row ?? null) as RacketRow | null;
  });
