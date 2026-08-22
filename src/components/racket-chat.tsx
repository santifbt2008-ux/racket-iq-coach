import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Quieres comparar raquetas o cuerdas?",
  "¿Qué raqueta me recomiendas?",
  "¿Qué cuerda debería usar?",
  "¿Qué tensión me recomiendas?",
  "¿Cuál es la diferencia entre la Wilson Blade 98 16x19 y la Babolat Pure Aero?",
];

export function RacketChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "No pudimos contactar al asistente. Inténtalo de nuevo.");
      } else {
        setMessages([...next, { role: "assistant", content: data.reply ?? "" }]);
      }
    } catch {
      setError("Se perdió la conexión con el asistente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel elevated flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Asistente de tenis RacketIQ</span>
        <span className="ml-auto text-[11px] text-muted-foreground">Datos reales del catálogo</span>
      </div>

      <div
        className={`space-y-4 overflow-y-auto px-5 py-5 ${compact ? "max-h-[340px] min-h-[220px]" : "max-h-[55vh] min-h-[320px]"}`}
      >
        {!messages.length && (
          <p className="text-sm text-muted-foreground">
            Pregúntame sobre raquetas, cuerdas, tensiones, patrones de encordado o comparaciones
            entre modelos. Solo respondo con lo que existe en nuestra base de datos.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-surface-strong text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-primary" />
            Consultando el catálogo…
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.slice(0, compact ? 4 : SUGGESTIONS.length).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              disabled={loading}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta…"
            aria-label="Escribe tu pregunta"
            className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
