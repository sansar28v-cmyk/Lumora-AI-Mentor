import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOnboarding } from "@/lib/onboarding.functions";
import { domainById } from "@/lib/domains";
import { getFormattedAnalysis } from "@/lib/onboarding-types";
import { getRecommendedCertifications } from "@/lib/domain-certifications";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Lumora" },
      { name: "description", content: "Your personalized career dashboard: readiness score, roadmap progress, certifications and recommended projects." },
      { property: "og:title", content: "Dashboard · Lumora" },
      { property: "og:description", content: "Your AI career command center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchOnboarding = useServerFn(getOnboarding);
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => fetchOnboarding({}),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const profile = data?.profile ?? null;
  const result = data?.result ?? null;
  const domain = domainById(profile?.career_domain);
  const readiness = profile?.readiness_score ?? result?.percentage ?? 0;
  const topics = result?.analysis?.topicScores ?? [];
  const analysis = getFormattedAnalysis(result?.analysis);
  const firstName = (profile?.full_name ?? "there").split(" ")[0];

  return (
    <AppLayout>
      <section className="rounded-2xl border bg-card p-5 sm:p-8 md:p-10 mb-8 max-w-full overflow-hidden">
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between min-w-0">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {domain?.name ?? "Your career track"}
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {result?.analysis?.summary ??
                "Complete your assessment to unlock a personalized readiness breakdown."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl">
                <Link to="/roadmap">
                  Continue roadmap <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/assessments">Take weekly assessment</Link>
              </Button>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl border bg-muted/30 p-5 sm:p-6 text-center w-full md:w-auto">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Industry readiness</div>
            <div className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">{readiness}%</div>
            <Progress value={readiness} className="mt-4 h-2 w-full max-w-[12rem] mx-auto" />
            <div className="mt-3 text-xs text-muted-foreground">Skill level: {profile?.skill_level ?? "—"}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Stat label="Assessment Score" value={result ? `${result.percentage}%` : "—"} icon={<Target className="h-4 w-4" />} />
        <Stat label="Roadmap Weeks" value={result?.roadmap?.length ?? 0} icon={<CalendarDays className="h-4 w-4" />} />
        <Stat label="Certifications" value={result?.certifications?.length ?? 0} icon={<Award className="h-4 w-4" />} />
        <Stat label="Weekly Hours" value={profile?.weekly_hours ? `${profile.weekly_hours} hrs` : "—"} icon={<Clock className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8 max-w-full">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-4 sm:p-6 min-w-0">
          <h2 className="font-semibold mb-1">Skill gap analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">Generated from your {domain?.name ?? "domain"} assessment.</p>
          <div className="h-72">
            {topics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topics} outerRadius="75%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} />
                  <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No assessment data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-6 min-w-0">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> Focus areas
          </h2>
          <ul className="space-y-3 text-sm">
            {analysis.weakAreas.map((w) => (
              <li key={w} className="flex gap-2.5">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {w}
              </li>
            ))}
            {analysis.weakAreas.length === 0 && (
              <li className="text-muted-foreground">No weak areas detected yet.</li>
            )}
          </ul>
          <h3 className="mt-6 mb-3 font-semibold text-sm">Strengths</h3>
          <ul className="space-y-2 text-sm">
            {analysis.strengths.map((s) => (
              <li key={s} className="flex gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {s}
              </li>
            ))}
            {analysis.strengths.length === 0 && (
              <li className="text-muted-foreground">No verified strengths yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-semibold">Next up in your roadmap</h2>
              <p className="text-sm text-muted-foreground">Your first weeks, tailored to {profile?.weekly_hours ?? 5} hrs/week.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/roadmap">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {(result?.roadmap ?? []).slice(0, 4).map((w) => (
              <div key={w.week} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary">Week {w.week}</Badge>
                  <span className="text-xs text-muted-foreground">{w.hours} hrs</span>
                </div>
                <div className="font-medium text-sm">{w.title}</div>
                <p className="text-sm text-muted-foreground">{w.focus}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-semibold">Recommended for you</h2>
              <p className="text-sm text-muted-foreground">Certifications and projects matched to your level.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/certifications">Browse</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {((result?.certifications?.length ? result.certifications : getRecommendedCertifications(profile?.career_domain))).slice(0, 2).map((c) => (
              <div key={c.name} className="rounded-2xl border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:border-primary/30 transition-all">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Award className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">{c.provider}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">{c.difficulty ?? "Intermediate"}</Badge>
                  </div>
                  <div className="font-semibold text-sm leading-snug mt-0.5 truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.duration}</div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 rounded-xl w-full sm:w-auto justify-center">
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    Official Page <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            ))}
            {(result?.projects ?? []).slice(0, 2).map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-4 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Rocket className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-sm">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.level} · {p.time}</div>
                </div>
                <Button asChild size="sm" variant="outline" className="ml-auto shrink-0">
                  <Link to="/projects">View</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
