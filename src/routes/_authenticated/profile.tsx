import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Clock, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PageIntro, PageLoader } from "@/components/page-states";
import { useOnboarding } from "@/lib/use-onboarding";
import { updateProfile } from "@/lib/app.functions";
import { domainById, LEARNING_GOALS } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Lumora" },
      { name: "description", content: "Your Lumora career profile: domain, goal, readiness score, strengths and recommended certifications." },
      { property: "og:title", content: "Profile · Lumora" },
      { property: "og:description", content: "Your industry-ready career profile in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { isLoading, profile, result } = useOnboarding();
  const queryClient = useQueryClient();
  const save = useServerFn(updateProfile);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setBio((profile as unknown as { bio?: string | null }).bio ?? "");
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => save({ data: { full_name: fullName, bio } }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <AppLayout title="Profile"><PageLoader /></AppLayout>;

  const domain = domainById(profile?.career_domain);
  const goal = LEARNING_GOALS.find((g) => g.id === profile?.learning_goal)?.label ?? profile?.learning_goal ?? "—";
  const readiness = profile?.readiness_score ?? result?.percentage ?? 0;
  const initials = (profile?.full_name ?? "You").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AppLayout title="Profile">
      <PageIntro title="Your profile" description="Everything here comes from your account and your AI assessment." />

      <div className="mb-8 rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary/10 text-2xl font-semibold text-primary">
            {initials}
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{profile?.full_name ?? "Your name"}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {domain && <Badge variant="secondary">{domain.name}</Badge>}
              {profile?.skill_level && <Badge variant="outline">{profile.skill_level}</Badge>}
              {profile?.experience_level && <Badge variant="outline" className="capitalize">{profile.experience_level}</Badge>}
            </div>
          </div>
          <div className="shrink-0 rounded-2xl border bg-muted/30 p-5 text-center">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Industry readiness</div>
            <div className="mt-1 text-4xl font-semibold tracking-tight">{readiness}%</div>
            <Progress value={readiness} className="mt-3 h-2 w-40" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold">Edit details</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="full-name">Full name</label>
                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="bio">Bio</label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-xl" placeholder="What are you working towards?" />
              </div>
              <Button className="rounded-xl" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold">Assessed strengths</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(result?.analysis?.strengths ?? []).map((s) => (
                <span key={s} className="rounded-lg border bg-muted/40 px-3 py-1.5 text-sm">{s}</span>
              ))}
              {(result?.analysis?.strengths ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Complete your assessment to see verified strengths.</p>
              )}
            </div>
            <h3 className="mt-6 font-semibold">Focus areas</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(result?.analysis?.weakAreas ?? []).map((s) => (
                <span key={s} className="rounded-lg border bg-muted/40 px-3 py-1.5 text-sm">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-4 font-semibold">Career setup</h3>
            <dl className="space-y-3 text-sm">
              <Row icon={<Target className="h-4 w-4" />} label="Goal" value={goal} />
              <Row icon={<Clock className="h-4 w-4" />} label="Weekly hours" value={profile?.weekly_hours ? `${profile.weekly_hours} hrs` : "—"} />
              <Row icon={<Award className="h-4 w-4" />} label="Assessment" value={result ? `${result.score}/${result.total} (${result.percentage}%)` : "—"} />
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-4 font-semibold">Recommended certifications</h3>
            <ul className="space-y-3 text-sm">
              {(result?.certifications ?? []).map((c) => (
                <li key={c.name}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{c.name}</a>
                  <div className="text-xs text-muted-foreground">{c.provider} · {c.duration}</div>
                </li>
              ))}
              {(result?.certifications ?? []).length === 0 && (
                <li className="text-muted-foreground">No recommendations yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-muted-foreground">{icon} {label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
