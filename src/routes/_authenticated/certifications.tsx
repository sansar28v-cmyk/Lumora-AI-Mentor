import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Award,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageIntro, PageLoader } from "@/components/page-states";
import { useOnboarding } from "@/lib/use-onboarding";
import { domainById } from "@/lib/domains";
import { getRecommendedCertifications } from "@/lib/domain-certifications";
import type { CertificationRec } from "@/lib/onboarding-types";
import { toast } from "sonner";

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

export function Certifications() {
  const { isLoading, profile, result } = useOnboarding();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const [provider, setProvider] = useState<string>("All");
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedCerts, setSavedCerts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lumora_saved_certs");
      if (stored) setSavedCerts(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleSave = (name: string) => {
    setSavedCerts((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
      try {
        localStorage.setItem("lumora_saved_certs", JSON.stringify(next));
      } catch {}
      if (next.includes(name)) {
        toast.success(`Saved "${name}" to your target certifications.`);
      } else {
        toast("Removed from target certifications.");
      }
      return next;
    });
  };

  if (isLoading) return <AppLayout title="Certification Hub"><PageLoader /></AppLayout>;

  const domain = domainById(profile?.career_domain);
  const rawCerts: CertificationRec[] = result?.certifications ?? [];
  const domainFallback = getRecommendedCertifications(profile?.career_domain);

  // Combine user's result certs with domain recommendations so there are rich options
  const certMap = new Map<string, CertificationRec>();
  [...rawCerts, ...domainFallback].forEach((c) => {
    if (c.name && !certMap.has(c.name)) certMap.set(c.name, c);
  });

  const allCerts = Array.from(certMap.values());
  const providers = ["All", ...Array.from(new Set(allCerts.map((c) => c.provider)))];

  const filtered = allCerts.filter((c) => {
    const matchesLevel = level === "All" || (c.difficulty ?? "").toLowerCase() === level.toLowerCase();
    const matchesProvider = provider === "All" || c.provider.toLowerCase() === provider.toLowerCase();
    const matchesQuery =
      q === "" ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.provider.toLowerCase().includes(q.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(q.toLowerCase());
    const matchesSaved = !onlySaved || savedCerts.includes(c.name);
    return matchesLevel && matchesProvider && matchesQuery && matchesSaved;
  });

  return (
    <AppLayout title="Certification Hub">
      <PageIntro
        eyebrow={domain?.name ?? "Your track"}
        title="Official Certifications & Credentials"
        description={
          allCerts.length
            ? `${allCerts.length} verified official certifications recommended for ${domain?.name ?? "your career domain"} at ${result?.skill_level ?? profile?.experience_level ?? "your"} level.`
            : "Your personalized certification roadmap appears here."
        }
      />

      {/* Summary Stat Banner */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-semibold tracking-tight">{allCerts.length}</div>
              <div className="text-xs text-muted-foreground">Matched certifications</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-semibold tracking-tight">{providers.length - 1}</div>
              <div className="text-xs text-muted-foreground">Official partner issuers</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Bookmark className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-semibold tracking-tight">{savedCerts.length}</div>
              <div className="text-xs text-muted-foreground">Target certs saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by certification name, issuer, or skills..."
              className="pl-10 rounded-xl bg-card"
            />
          </div>
          <Button
            variant={onlySaved ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlySaved((prev) => !prev)}
            className="rounded-xl shrink-0"
          >
            <Bookmark className="h-4 w-4 mr-1.5" />
            Saved ({savedCerts.length})
          </Button>
        </div>

        {/* Level & Provider Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Level:
            </span>
            {levels.map((l) => (
              <Button
                key={l}
                size="sm"
                variant={level === l ? "default" : "ghost"}
                className="rounded-xl text-xs h-8 px-3"
                onClick={() => setLevel(l)}
              >
                {l}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1">Issuer:</span>
            {providers.slice(0, 5).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={provider === p ? "secondary" : "outline"}
                className="rounded-xl text-xs h-8 px-3"
                onClick={() => setProvider(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Certification Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No certifications match your filters"
          description="Try broadening your search term or resetting your level & provider filters."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const isSaved = savedCerts.includes(c.name);
            const matchScore = c.matchScore ?? 90;

            return (
              <div
                key={c.name}
                className="group relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold">
                      <Award className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                          {c.provider}
                        </span>
                        {c.featured && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-none">
                            Top Recommendation
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold leading-snug text-base text-foreground mt-0.5 group-hover:text-primary transition-colors">
                        {c.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSave(c.name)}
                    aria-label={isSaved ? "Remove bookmark" : "Bookmark certification"}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-5 w-5 text-primary fill-primary/20" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="mt-4 flex-1 text-sm text-muted-foreground leading-relaxed">
                  {c.description}
                </p>

                {/* Skills tags */}
                {c.skills && c.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.skills.map((skill) => (
                      <span key={skill} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Badges & Duration */}
                <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        c.difficulty === "Advanced"
                          ? "border-destructive/30 text-destructive bg-destructive/5"
                          : c.difficulty === "Intermediate"
                          ? "border-amber-500/30 text-amber-600 bg-amber-500/5"
                          : "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                      }
                    >
                      {c.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {c.duration}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    <Sparkles className="h-3 w-3" /> {matchScore}% Match
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild variant="default" size="sm" className="flex-1 rounded-xl">
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      Official Page <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  </Button>
                  <Button
                    variant={isSaved ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleSave(c.name)}
                    className="rounded-xl px-3"
                  >
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default Certifications;
