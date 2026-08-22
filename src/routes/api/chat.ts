import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { RacketRow } from "@/lib/racket-db";
import { STRING_CATEGORIES } from "@/lib/strings-db";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function catalogContext(rows: RacketRow[]) {
  const line = (r: RacketRow) => {
    const f = (label: string, v: unknown, unit = "") =>
      v === null || v === undefined || v === "" ? `${label}=sin dato` : `${label}=${v}${unit}`;
    return [
      `${r.brand} ${r.model}`,
      f("año", r.year),
      f("tipo", r.racket_type),
      f("cabeza", r.head_size, " sq in"),
      f("peso", r.weight, "g"),
      f("balance", r.balance, "cm"),
      f("swingweight", r.swingweight),
      f("rigidez", r.stiffness, " RA"),
      f("beam", r.beam_width),
      f("patrón", r.string_pattern),
      f("largo", r.length, '"'),
      f("composición", r.composition),
      f("potencia", r.power_level),
      f("velocidad de swing", r.swing_speed),
      f("estilo de jugador", r.stroke_style),
      f("precio USD", r.price),
      `ficha=/catalog/${r.slug}`,
    ].join(" | ");
  };
  return rows.map(line).join("\n");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMessage[] };
        const messages = (body.messages ?? []).slice(-12);
        if (!messages.length) return new Response("Sin mensajes", { status: 400 });

        const supabase = createClient<Database>(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );
        const { data, error } = await supabase
          .from("rackets")
          .select(
            "id, slug, brand, model, year, racket_type, head_size, length, weight, balance, swingweight, stiffness, beam_width, string_pattern, composition, power_level, swing_speed, stroke_style, price, image_url, description, product_url, is_current, created_at",
          )
          .order("brand")
          .returns<RacketRow[]>();
        if (error) return new Response(`Error de base de datos: ${error.message}`, { status: 500 });

        const rows = data ?? [];
        const system = `Eres el asistente de tenis de RacketIQ. Respondes SIEMPRE en español mexicano, de forma breve y concreta.

REGLAS DURAS:
- Las ÚNICAS raquetas que existen para ti son las de la lista de abajo (${rows.length} modelos). No menciones raquetas fuera de esa lista; si el usuario pregunta por una que no está, dilo claramente: "No tengo esa raqueta en nuestra base de datos".
- NUNCA inventes especificaciones. Si un campo dice "sin dato", responde que no tenemos ese dato.
- Cuando compares raquetas, usa los números reales (peso, cabeza, balance, swingweight, rigidez, beam, patrón) y explica qué implican.
- Potencia/control/efecto/sensación puedes explicarlos de forma cualitativa a partir de esas especificaciones, aclarando que es una interpretación de los datos, no una medición.
- Para cuerdas y tensiones usa las categorías de cuerda listadas; no inventes modelos con especificaciones exactas.
- Puedes enlazar fichas con rutas como /catalog/<slug>.

CATÁLOGO DE RAQUETAS (fuente única de verdad):
${catalogContext(rows)}

CATEGORÍAS DE CUERDA:
${STRING_CATEGORIES.map((c) => `${c.name}: ${c.summary} Potencia ${c.power}/10, control ${c.control}/10, efecto ${c.spin}/10, comodidad ${c.comfort}/10, durabilidad ${c.durability}/10. Tensión típica ${c.tension}.`).join("\n")}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": process.env["LOVABLE_API_KEY"]!,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          const message =
            res.status === 429
              ? "Demasiadas solicitudes seguidas. Espera unos segundos e inténtalo de nuevo."
              : res.status === 402
                ? "Se agotaron los créditos de IA del proyecto. El propietario debe recargarlos."
                : res.status === 403
                  ? "La IA está bloqueada por la configuración del espacio de trabajo."
                  : `El servicio de IA respondió con un error (${res.status}).`;
          console.error("AI gateway error", res.status, text);
          return Response.json({ error: message }, { status: res.status });
        }

        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reply = json.choices?.[0]?.message?.content ?? "";
        return Response.json({ reply });
      },
    },
  },
});
