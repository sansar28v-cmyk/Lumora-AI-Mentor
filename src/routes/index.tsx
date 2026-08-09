import { LogoMark } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Paperclip,
  Compass,
  Award,
  Brain,
  FolderGit2,
  Users,
  LineChart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lumora — Your AI Career Co-Pilot" },
      { name: "description", content: "Tell Lumora where you're headed and what you love — get a career roadmap, assessments and certifications built just for you." },
      { property: "og:title", content: "Lumora — Your AI Career Co-Pilot" },
      { property: "og:description", content: "AI-built career roadmaps, adaptive assessments and real certifications, personalized to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PHRASES = [
  "I want to become an AI engineer in 6 months…",
  "Switch from support to full-stack development…",
  "Land a cybersecurity internship this summer…",
];

function useTypewriter() {
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(PHRASES[0]);
      return;
    }
    let phrase = 0;
    let i = 0;
    let deleting = false;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const full = PHRASES[phrase];
      if (!deleting) {
        i++;
        setText(full.slice(0, i));
        if (i === full.length) {
          deleting = true;
          timer.current = setTimeout(tick, 1900);
          return;
        }
        timer.current = setTimeout(tick, 42 + Math.random() * 40);
      } else {
        i--;
        setText(full.slice(0, i));
        if (i === 0) {
          deleting = false;
          phrase = (phrase + 1) % PHRASES.length;
          timer.current = setTimeout(tick, 300);
          return;
        }
        timer.current = setTimeout(tick, 22);
      }
    };

    timer.current = setTimeout(tick, 700);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return text;
}

const FEATURES = [
  { icon: Compass, title: "AI career roadmap", body: "A 12-week plan built from your domain, experience and weekly hours — week by week, topic by topic." },
  { icon: Brain, title: "Adaptive assessments", body: "20-question adaptive quizzes that find your real level, then explain every answer you missed." },
  { icon: Award, title: "Real certifications", body: "Only official, recognised certifications matched to your track — with direct provider links." },
  { icon: LineChart, title: "Skill gap analytics", body: "Topic-level radar charts and an industry readiness score that updates as you progress." },
  { icon: FolderGit2, title: "Project hub", body: "Portfolio-grade project briefs picked to close your weakest skills first." },
  { icon: Users, title: "Human tutors", body: "Matched mentors in your domain when the AI alone isn't enough." },
];

const STEPS = [
  { n: "01", title: "Tell us your goal", body: "Pick a career domain, goal, experience level and how many hours you can give each week." },
  { n: "02", title: "Take the AI assessment", body: "A domain-specific adaptive quiz benchmarks your current strengths and weak topics." },
  { n: "03", title: "Get your plan", body: "Roadmap, certifications, projects and a personalized dashboard — generated instantly." },
];

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const typed = useTypewriter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" as any, replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0" style={{ backgroundImage: "var(--gradient-glow)" }} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[48vh] overflow-hidden sm:h-[55vh]">
          <img
            src="https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/rove.png"
            alt=""
            aria-hidden="true"
            className="ken-burns h-full w-full object-cover"
            style={{ objectPosition: "center 42%", transformOrigin: "center 68%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--background) 0%, color-mix(in oklab, var(--background) 88%, transparent) 16%, color-mix(in oklab, var(--background) 38%, transparent) 36%, transparent 60%, color-mix(in oklab, var(--background) 12%, transparent) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col px-5 pt-5 sm:px-8 sm:pt-6 lg:px-[clamp(28px,4vw,54px)]">
          {/* nav */}
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
            <Link to="/" className="fade-rise flex min-w-0 items-center gap-2.5">
              <LogoMark className="h-6 w-6 shrink-0" />
              <span className="truncate font-display text-base font-bold tracking-[0.14em] sm:text-lg">LUMORA</span>
            </Link>
            <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              {[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how" },
                { label: "FAQs", href: "#faq" },
              ].map((l, idx) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="fade-rise transition-colors hover:text-foreground"
                  style={{ animationDelay: `${60 + idx * 50}ms` }}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <Link
                to="/auth"
                className="fade-rise text-sm font-medium text-foreground/85 transition-opacity hover:opacity-60"
                style={{ animationDelay: "200ms" }}
              >
                Login
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="fade-rise inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-[var(--shadow-card)] transition-transform hover:-translate-y-px sm:px-5 sm:py-2.5"
                style={{ animationDelay: "250ms" }}
              >
                Start free <ArrowRight className="hidden h-4 w-4 sm:block" />
              </Link>
            </div>
          </header>

          {/* hero body */}
          <div className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-16">
            <div className="fade-rise flex items-center gap-3" style={{ animationDelay: "260ms" }}>
              <span className="h-px w-6 bg-primary" />
              <span className="font-mono-ui text-[10px] uppercase tracking-[0.26em] text-muted-foreground sm:text-[11px]">
                AI Career Planner
              </span>
              <span className="h-px w-6 bg-primary" />
            </div>

            <h1
              className="fade-rise mt-6 font-display text-[clamp(38px,8vw,92px)] font-semibold leading-[1.02] tracking-[-0.035em]"
              style={{ animationDelay: "340ms" }}
            >
              Where should we
              <br />
              take <span className="text-primary">you?</span>
            </h1>

            <p
              className="fade-rise mt-5 max-w-[560px] text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-[18.5px]"
              style={{ animationDelay: "440ms" }}
            >
              Tell Lumora where you're headed and what you love — get a career plan built just for you.
            </p>

            {/* input card */}
            <div
              className="fade-rise frost mt-8 flex w-full max-w-[700px] flex-col gap-3 rounded-[22px] p-3.5 sm:mt-10 sm:flex-row sm:items-center sm:gap-3.5 sm:py-3.5 sm:pl-[22px] sm:pr-3.5"
              style={{ animationDelay: "540ms" }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-1 px-1 text-left sm:px-0">
                <span className={`truncate text-[15px] ${typed ? "text-foreground" : "text-muted-foreground"}`}>
                  {typed || "Describe your career goal…"}
                </span>
                <span className="caret-blink inline-block h-[19px] w-[2px] shrink-0 bg-primary" />
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Attach your resume"
                  className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/5"
                  onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as any })}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-foreground px-5 py-3 text-sm font-medium text-background shadow-[var(--shadow-card)] transition-transform hover:-translate-y-px sm:flex-none"
                >
                  Plan my path
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* chips */}
            <div className="fade-rise mt-5 flex flex-wrap items-center justify-center gap-2.5" style={{ animationDelay: "640ms" }}>
              {["Career switch", "Certifications", "Off the beaten path"].map((c) => (
                <Link
                  key={c}
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="frost inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:px-4"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-y border-border/70 bg-card/40">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:px-8 lg:grid-cols-4">
          {[
            { k: "12-week", v: "personalized roadmap" },
            { k: "20-Q", v: "adaptive assessment" },
            { k: "6+", v: "official certifications" },
            { k: "1:1", v: "human tutor matching" },
          ].map((s) => (
            <div key={s.k} className="min-w-0">
              <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <span className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Everything included
          </span>
          <h2 className="mt-4 font-display text-[clamp(28px,4.4vw,44px)] font-semibold leading-[1.1] tracking-tight">
            One workspace for the whole journey
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            From your first assessment to your first offer — every module reacts to the career domain you choose.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="border-t border-border/70 bg-card/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <span className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              How it works
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,4.4vw,44px)] font-semibold leading-[1.1] tracking-tight">
              Three steps to a plan that fits
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-background p-6">
                <div className="font-mono-ui text-sm text-primary">{s.n}</div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-[clamp(26px,4vw,38px)] font-semibold tracking-tight">
          Frequently asked
        </h2>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {[
            { q: "Is Lumora free to start?", a: "Yes — create an account, finish onboarding and your full roadmap is generated at no cost." },
            { q: "Which career domains are supported?", a: "Full-stack, AI/ML, data, cybersecurity, cloud/DevOps, mobile, product and more. Your domain drives every module." },
            { q: "Are the certifications real?", a: "Only official, recognised programs from real providers, with direct links — no invented credentials." },
            { q: "Can I retake the assessment?", a: "Yes. Weekly assessments keep your readiness score and skill gaps current." },
          ].map((f) => (
            <details key={f.q} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-card to-card p-8 text-center sm:p-14">
          <h2 className="font-display text-[clamp(26px,4.4vw,42px)] font-semibold leading-tight tracking-tight">
            Your next role starts with one honest plan.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Five minutes of onboarding, twelve weeks of clarity.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-px"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
