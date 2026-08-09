import { LogoMark } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { mode?: Mode; redirect?: string } => ({
    mode: (s.mode as Mode) ?? "signin",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Sign in · Lumora" },
      { name: "description", content: "Sign in or create your Lumora account to unlock your personalized career intelligence." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "At least 8 characters").max(72);
const nameSchema = z.string().trim().min(2, "Enter your name").max(80);

function AuthPage() {
  const { mode: initialMode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "tutor" | "admin">("student");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => setMode(initialMode ?? "signin"), [initialMode]);

  useEffect(() => {
    const handleAuthRedirect = async (session: any) => {
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .maybeSingle();

      const target = profile?.onboarding_completed ? (redirect ?? "/dashboard") : "/onboarding";
      navigate({ to: target as any, replace: true });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) handleAuthRedirect(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        handleAuthRedirect(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirect]);

  const go = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.session.user.id)
        .maybeSingle();

      const target = profile?.onboarding_completed ? (redirect ?? "/dashboard") : "/onboarding";
      navigate({ to: target as any, replace: true });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) return toast.error(err.issues[0].message);
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (remember) { try { localStorage.setItem("sp-remembered-email", email); } catch {} }
    toast.success("Welcome back!");
    go();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(fullName);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) return toast.error(err.issues[0].message);
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes("signups are disabled")) {
        return toast.error(
          "Email provider is turned off in Supabase. Turn on 'Enable Email provider' under Auth > Providers > Email."
        );
      }
      if (
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("email_send_rate_limit") ||
        (error as any).status === 429
      ) {
        // Attempt direct sign-in if the account user row was created
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInErr) {
          toast.success("Account created — welcome to Lumora!");
          return go();
        }
        return toast.error(
          "Email rate limit exceeded by Supabase SMTP. Turn off 'Confirm Email' in Supabase Auth settings or use Google/GitHub sign-in."
        );
      }
      return toast.error(error.message);
    }

    if (data.session) {
      toast.success("Account created — welcome to Lumora!");
      return go();
    }

    // If session is null (pending email confirmation), sign in directly so user enters immediately
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInErr && signInData.session) {
      toast.success("Account created — welcome to Lumora!");
      return go();
    }

    toast.success("Account created — you're in!");
    go();
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(email); }
    catch (err) { if (err instanceof z.ZodError) return toast.error(err.issues[0].message); }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      if (
        error.message?.toLowerCase().includes("rate limit") ||
        (error as any).status === 429
      ) {
        return toast.error(
          "Supabase email rate limit reached. Please try again shortly or use OAuth sign-in."
        );
      }
      return toast.error(error.message);
    }
    toast.success("Password reset link sent — check your inbox.");
    setMode("signin");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
      setGoogleLoading(false);
      return toast.error(error.message || "Google sign-in failed");
    }
  };

  const handleGithub = async () => {
    setGithubLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
      setGithubLoading(false);
      if (error.message?.includes("not enabled") || (error as any).error_code === "validation_failed") {
        return toast.error("GitHub sign-in is not enabled in your Supabase Dashboard yet. Enable GitHub under Auth > Providers.");
      }
      return toast.error(error.message || "GitHub sign-in failed");
    }
  };

  useEffect(() => {
    try {
      const remembered = localStorage.getItem("sp-remembered-email");
      if (remembered) setEmail(remembered);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-primary via-[color-mix(in_oklab,var(--primary)_82%,black)] to-[color-mix(in_oklab,var(--primary)_45%,black)]">
        <div className="absolute inset-0 opacity-40" style={{ background: "var(--gradient-glow)" }} />
        <div
          className="absolute -top-32 -left-24 h-96 w-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, white, transparent 65%)" }}
        />
        <div
          className="absolute -bottom-40 -right-16 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, white, transparent 60%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 30% 20%, black, transparent 75%)",
          }}
        />

        <div className="relative flex items-center gap-2.5 text-white animate-fade-in">
          <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/25">
            <LogoMark className="h-5 w-5 text-white" />
          </div>
          <div className="font-display font-bold tracking-[0.14em] text-lg">LUMORA</div>
        </div>

        <div className="relative text-white max-w-lg animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 ring-1 ring-white/20 backdrop-blur px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
            Career intelligence
          </span>
          <h2 className="mt-5 text-[2.6rem] leading-[1.05] font-bold tracking-tight">
            Your AI co-pilot for a career that compounds.
          </h2>
          <p className="mt-5 text-white/75 leading-relaxed">
            Personalized roadmaps, adaptive assessments, curated certifications, and human tutors — all in one workspace.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-3">
            {[
              { k: "12-week", v: "AI roadmap" },
              { k: "20-Q", v: "Adaptive quiz" },
              { k: "Real", v: "Certifications" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                <div className="text-white font-semibold text-sm">{s.k}</div>
                <div className="text-white/65 text-xs mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-white/55 text-xs">© {new Date().getFullYear()} LUMORA</div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-col justify-center px-5 py-8 sm:px-12 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(60% 50% at 70% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent)" }}
        />
        <div className="relative w-full max-w-md mx-auto animate-fade-in">
          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <Link to="/" className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Back to home</span>
            </Link>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <LogoMark className="h-5 w-5" />
              <span className="font-display text-[13px] font-bold tracking-[0.14em]">LUMORA</span>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--primary)_55%,transparent)] p-6 sm:p-9">
            <h1 className="text-[1.7rem] font-bold tracking-tight">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "signin" && "Sign in to continue your learning journey."}
              {mode === "signup" && "Start your personalized career roadmap in seconds."}
              {mode === "forgot" && "We'll email you a secure link to set a new password."}
            </p>

            {mode !== "forgot" && (
              <>
                <div className="mt-6 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading || githubLoading}
                    className="w-full h-11 rounded-xl border border-border bg-background/80 hover:bg-muted hover:border-primary/40 transition flex items-center justify-center gap-2.5 font-medium text-sm disabled:opacity-60 cursor-pointer"
                  >
                    {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={handleGithub}
                    disabled={googleLoading || githubLoading}
                    className="w-full h-11 rounded-xl border border-border bg-background/80 hover:bg-muted hover:border-primary/40 transition flex items-center justify-center gap-2.5 font-medium text-sm disabled:opacity-60 cursor-pointer"
                  >
                    {githubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GithubIcon />}
                    Continue with GitHub
                  </button>
                </div>
                <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form
              onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgot}
              className="space-y-4"
            >
              {mode === "signup" && (
                <Field icon={User} label="Full name" value={fullName} onChange={setFullName} placeholder="Ada Lovelace" />
              )}
              <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
              {mode !== "forgot" && (
                <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
              )}

              {mode === "signup" && (
                <div>
                  <div className="text-xs font-medium mb-2 text-muted-foreground">I am a</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "tutor", "admin"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`h-10 rounded-xl text-sm font-medium capitalize border transition ${
                          role === r
                            ? "gradient-primary text-white border-transparent shadow-md shadow-primary/25"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "signin" && (
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-muted-foreground">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setMode("forgot")} className="text-primary hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary/25 hover:opacity-95 hover:-translate-y-px active:translate-y-0 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" && "Sign in"}
                {mode === "signup" && "Create account"}
                {mode === "forgot" && "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" && (
                <>New here?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Create an account</button>
                </>
              )}
              {mode === "signup" && (
                <>Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button>
                </>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Back to sign in</button>
              )}
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            By continuing you agree to Lumora's terms and privacy policy.
          </p>

          <Footer compact />

        </div>
      </div>
    </div>
  );
}


function Field({
  icon: Icon, label, value, onChange, type = "text", placeholder,
}: { icon: React.ComponentType<any>; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-xs font-medium mb-1.5 text-muted-foreground">{label}</div>
      <div className="relative">
        <Icon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/60 transition"
          autoComplete={type === "password" ? "current-password" : type}
        />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4 5.6 5.6 0 0 1 4 1.5l2.7-2.6A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-2H12z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
