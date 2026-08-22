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
      { title: "Sign in — RacketIQ admin access" },
      { name: "description", content: "Sign in to RacketIQ to manage the tennis racket catalog database." },
      { property: "og:title", content: "Sign in — RacketIQ" },
      { property: "og:description", content: "Access the RacketIQ racket catalog admin tools." },
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
        toast.success("Account created — check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed");
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
            <p className="eyebrow">Account</p>
            <h1 className="text-display mt-3 text-4xl font-extrabold">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Catalog administration requires an account with admin access.
            </p>

            <form onSubmit={submit} className="panel mt-8 space-y-4 p-6">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">
                  Email
                </label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm text-muted-foreground">
                  Password
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
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
              </button>
              <button
                type="button"
                onClick={google}
                className="w-full rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary"
              >
                Continue with Google
              </button>
              <p className="pt-2 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
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
