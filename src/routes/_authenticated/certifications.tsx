import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, ExternalLink, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageIntro, PageLoader } from "@/components/page-states";
import { useOnboarding } from "@/lib/use-onboarding";
import { domainById } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/certifications")({
  head: () => ({
    meta: [
      { title: "Certification Hub · Lumora" },
      { name: "description", content: "Official certifications recommended by AI for your career domain, skill level and goal." },
      { property: "og:title", content: "Certification Hub · Lumora" },
      { property: "og:description", content: "AI-recommended official certifications for your career goal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Certifications,
});

const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;

function Certifications() {
  const { isLoading, profile, result } = useOnboarding();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("All");

  if (isLoading) return <AppLayout title="Certification Hub"><PageLoader /></AppLayout>;

  const certs = result?.certifications ?? [];
  const domain = domainById(profile?.career_domain);
  const filtered = certs.filter(
    (c) =>
      (level === "All" || (c.difficulty ?? "").toLowerCase() === level.toLowerCase()) &&
      (q === "" ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.provider.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppLayout title="Certification Hub">
      <PageIntro
        eyebrow={domain?.name ?? "Your track"}
        title="Certifications matched to you"
        description={
          certs.length
            ? `${certs.length} official certifications selected for ${domain?.name ?? "your domain"} at ${result?.skill_level ?? "your"} level.`
            : "Your certification recommendations appear here once your assessment is complete."
        }
      />

      {certs.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Complete the AI onboarding assessment and Lumora will recommend real, official certifications for your domain."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search certifications or providers"
                className="pl-9 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <div key={c.name} className="flex flex-col rounded-2xl border bg-card p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Award className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.provider}</div>
                    <h3 className="font-semibold leading-snug">{c.name}</h3>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{c.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">{c.duration}</span>
                </div>
                <Button asChild variant="outline" className="mt-5 rounded-xl">
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    Official page <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No certifications match your filters.</p>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}
