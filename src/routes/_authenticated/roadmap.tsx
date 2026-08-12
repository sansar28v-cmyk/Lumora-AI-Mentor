import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Clock, Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageIntro, PageLoader } from "@/components/page-states";
import { useOnboarding } from "@/lib/use-onboarding";
import { domainById } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({
    meta: [
      { title: "AI Career Roadmap · Lumora" },
      { name: "description", content: "Your AI-generated 12-week learning roadmap, tailored to your domain, assessment results and weekly study time." },
      { property: "og:title", content: "AI Career Roadmap · Lumora" },
      { property: "og:description", content: "A personalized weekly plan to reach your target role." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const { isLoading, profile, result } = useOnboarding();

  if (isLoading) return <AppLayout title="AI Career Roadmap"><PageLoader /></AppLayout>;

  const weeks = result?.roadmap ?? [];
  const domain = domainById(profile?.career_domain);

  return (
    <AppLayout title="AI Career Roadmap">
      <PageIntro
        eyebrow={domain?.name ?? "Your track"}
        title={`${weeks.length || 12}-week roadmap`}
        description={
          weeks.length
            ? `Built from your ${result?.percentage}% assessment (${result?.skill_level}) and ${profile?.weekly_hours ?? 5} hrs/week of study time.`
            : "Your roadmap appears here once your assessment is complete."
        }
      />

      {weeks.length === 0 ? (
        <EmptyState
          title="No roadmap yet"
          description="Finish the AI onboarding assessment and Lumora will generate a full 12-week plan for your domain."
        />
      ) : (
        <div className="relative pl-5 sm:pl-6 md:pl-8 max-w-full overflow-hidden">
          <div className="absolute left-[5px] sm:left-[7px] md:left-[11px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {weeks.map((w) => (
              <div key={w.week} className="relative">
                <span className="absolute -left-5 sm:-left-6 md:-left-8 top-5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                <div className="rounded-2xl border bg-card p-4 sm:p-5 md:p-6 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">Week {w.week}</Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {w.hours} hrs
                    </span>
                  </div>
                  <h3 className="mt-3 text-base sm:text-lg font-semibold leading-snug">{w.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{w.focus}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(w.topics ?? []).map((t) => (
                      <span key={t} className="rounded-lg border bg-muted/40 px-2.5 py-1 text-xs max-w-full truncate">{t}</span>
                    ))}
                  </div>
                  {w.outcome && (
                    <div className="mt-4 flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{w.outcome}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {weeks.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Summary icon={<CalendarDays className="h-4 w-4" />} label="Total weeks" value={weeks.length} />
          <Summary icon={<Clock className="h-4 w-4" />} label="Planned hours" value={weeks.reduce((a, w) => a + (w.hours || 0), 0)} />
          <Summary icon={<Target className="h-4 w-4" />} label="Goal" value={profile?.learning_goal ?? "—"} />
        </div>
      )}
    </AppLayout>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight capitalize">{value}</div>
    </div>
  );
}
