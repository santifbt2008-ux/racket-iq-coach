import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { MessageCircle, Search, Settings2, Zap } from "lucide-react";
import { CATALOG_DISCLAIMER } from "@/lib/racket-db";

export const MAIN_NAV = [
  { to: "/find-my-racket", label: "Encuentra tu raqueta", short: "Raqueta", icon: Search },
  { to: "/strings", label: "Encuentra tus cuerdas y tensión", short: "Cuerdas", icon: Zap },
  { to: "/modify", label: "Modifica tu raqueta", short: "Modifica", icon: Settings2 },
  { to: "/chat", label: "Chatbot", short: "Chatbot", icon: MessageCircle },
] as const;

const SECONDARY_NAV = [
  { to: "/catalog", label: "Catálogo" },
  { to: "/compare", label: "Comparar" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-display text-sm font-extrabold">R</span>
          </span>
          <span className="text-display text-lg font-extrabold tracking-tight">RacketIQ</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {SECONDARY_NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/find-my-racket"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Encuentra tu raqueta
        </Link>
      </div>
    </header>
  );
}

/** Primary app navigation, fixed to the bottom of the screen on every page. */
export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {MAIN_NAV.map((n) => (
          <li key={n.to}>
            <Link
              to={n.to}
              className="flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <n.icon className="h-5 w-5" />
              <span className="text-center leading-tight sm:hidden">{n.short}</span>
              <span className="hidden text-center leading-tight sm:block">{n.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 py-10 pb-28">
      <div className="mx-auto max-w-6xl space-y-3 px-5 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-display font-bold text-foreground">RacketIQ</span>
          {[...MAIN_NAV, ...SECONDARY_NAV].map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </div>
        <p className="max-w-2xl text-xs">{CATALOG_DISCLAIMER}</p>
      </div>
      <BottomNav />
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-5 py-12">{children}</div>;
}

export function RacketVisual({
  label,
  className = "",
  image = null,
}: {
  label: string;
  className?: string;
  image?: string | null;
}) {
  if (image) {
    return (
      <figure
        className={`relative grid place-items-center overflow-hidden rounded-2xl border border-border bg-surface-strong ${className}`}
      >
        <img
          src={image}
          alt={`Raqueta de tenis ${label}`}
          loading="lazy"
          className="h-full w-full object-contain p-6"
        />
      </figure>
    );
  }
  return (
    <div
      className={`court-grid relative grid place-items-center overflow-hidden rounded-2xl border border-border bg-surface-strong ${className}`}
      role="img"
      aria-label={`Ilustración de marcador de posición de la raqueta ${label}`}
    >
      <svg viewBox="0 0 120 260" className="h-full max-h-72 w-auto py-6 opacity-90">
        <g fill="none" stroke="currentColor" className="text-primary" strokeWidth="4">
          <ellipse cx="60" cy="80" rx="46" ry="66" />
          <path d="M46 140 L52 190 M74 140 L68 190" />
          <rect x="52" y="188" width="16" height="62" rx="8" className="text-muted-foreground" />
        </g>
        <g stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={20 + i * 10} y1="20" x2={20 + i * 10} y2="140" />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`h${i}`} x1="16" y1={26 + i * 11} x2="104" y2={26 + i * 11} />
          ))}
        </g>
      </svg>
      <span className="absolute bottom-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        Sin imagen con licencia
      </span>
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-display font-bold">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
