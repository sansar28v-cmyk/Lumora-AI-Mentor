import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Layers, Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, PageIntro, PageLoader } from "@/components/page-states";
import { useOnboarding } from "@/lib/use-onboarding";
import { domainById } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Project Hub · Lumora" },
      { name: "description", content: "Portfolio projects generated for your domain, assessment score and skill level." },
      { property: "og:title", content: "Project Hub · Lumora" },
      { property: "og:description", content: "Build projects that prove you are industry ready." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;

function Projects() {
  const { isLoading, profile, result } = useOnboarding();
  const [level, setLevel] = useState<(typeof levels)[number]>("All");

  if (isLoading) return <AppLayout title="Project Hub"><PageLoader /></AppLayout>;

  const projects = result?.projects ?? [];
  const domain = domainById(profile?.career_domain);
  const filtered = projects.filter((p) => level === "All" || p.level === level);

  return (
    <AppLayout title="Project Hub">
      <PageIntro
        eyebrow={domain?.name ?? "Your track"}
        title="Projects built around your gaps"
        description={
          projects.length
            ? `${projects.length} projects targeting your weak topics at ${result?.skill_level ?? ""} level.`
            : "Your project recommendations appear here once your assessment is complete."
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Complete the AI onboarding assessment and Lumora will design portfolio projects for your domain."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {levels.map((l) => (
              <Button
                key={l}
                size="sm"
                variant={level === l ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => setLevel(l)}
              >
                {l}
              </Button>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{p.level}</Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {p.time}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.problem}</p>

                {(p.objectives ?? []).length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Objectives</div>
                    <ul className="space-y-1.5 text-sm">
                      {p.objectives.map((o) => (
                        <li key={o} className="flex gap-2">
                          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {(p.stack ?? []).map((s) => (
                    <span key={s} className="rounded-lg border bg-muted/40 px-2.5 py-1 text-xs">{s}</span>
                  ))}
                </div>

                {(p.outcomes ?? []).length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">You will learn</div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {p.outcomes.map((o) => (
                        <li key={o} className="flex gap-2">
                          <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No projects at this level.</p>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}
