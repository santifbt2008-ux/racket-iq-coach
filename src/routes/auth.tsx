import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Acceso de administrador de RacketIQ" },
      { name: "description", content: "Inicia sesión en RacketIQ para gestionar la base de datos del catálogo de raquetas de tenis." },
      { property: "og:title", content: "Iniciar sesión — RacketIQ" },
      { property: "og:description", content: "Accede a las herramientas de administración del catálogo de raquetas de RacketIQ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cuenta creada — revisa tu correo si se requiere confirmación.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Error al iniciar sesión con Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  };

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <div className="mx-auto max-w-md">
            <p className="eyebrow">Cuenta</p>
            <h1 className="text-display mt-3 text-4xl font-extrabold">
              {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              La administración del catálogo requiere una cuenta con acceso de administrador.
            </p>

            <form onSubmit={submit} className="panel mt-8 space-y-4 p-6">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">
                  Correo electrónico
                </label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm text-muted-foreground">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Espera un momento…" : mode === "signin" ? "Iniciar sesión" : "Registrarse"}
              </button>
              <button
                type="button"
                onClick={google}
                className="w-full rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary"
              >
                Continuar con Google
              </button>
              <p className="pt-2 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "¿Aún no tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Regístrate" : "Inicia sesión"}
                </button>
              </p>
            </form>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
