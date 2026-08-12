import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, TrendingUp, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState, PageIntro, PageLoader } from "@/components/page-states";
import { useOnboarding } from "@/lib/use-onboarding";
import { domainById } from "@/lib/domains";
import { getFormattedAnalysis } from "@/lib/onboarding-types";

export const Route = createFileRoute("/_authenticated/assessments")({
  head: () => ({
    meta: [
      { title: "Assessment Results · Lumora" },
      { name: "description", content: "Your adaptive AI assessment: score, per-topic performance, full question review and recommended revisions." },
      { property: "og:title", content: "Assessment Results · Lumora" },
      { property: "og:description", content: "Every question, your answer and why it was right or wrong." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assessments,
});

function Assessments() {
  const { isLoading, profile, result } = useOnboarding();
  const [filter, setFilter] = useState<"all" | "wrong">("all");

  if (isLoading) return <AppLayout title="Assessments"><PageLoader /></AppLayout>;

  if (!result) {
    return (
      <AppLayout title="Assessments">
        <EmptyState
          title="No assessment taken yet"
          description="Complete the AI onboarding assessment to see your score, topic breakdown and full question review."
        />
      </AppLayout>
    );
  }

  const domain = domainById(profile?.career_domain);
  const topics = result.analysis?.topicScores ?? [];
  const analysis = getFormattedAnalysis(result.analysis);
  const questions = result.questions ?? [];
  const answers = result.answers ?? {};
  const shown = questions.filter((q) => filter === "all" || answers[String(q.id)] !== q.correctIndex);

  return (
    <AppLayout title="Assessments">
      <PageIntro
        eyebrow={domain?.name ?? "Your track"}
        title="Adaptive assessment results"
        description={`You scored ${result.score} of ${result.total} — measured level ${result.skill_level}.`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3 max-w-full">
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Score</div>
          <div className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{result.percentage}%</div>
          <Progress value={result.percentage} className="mt-4 h-2" />
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Correct answers</div>
          <div className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{result.score}/{result.total}</div>
          <div className="mt-4 text-xs text-muted-foreground">Across {topics.length} topics</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Skill level</div>
          <div className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{result.skill_level}</div>
          <div className="mt-4 text-xs text-muted-foreground">Self-declared: {result.experience_level ?? "—"}</div>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="mb-8 rounded-2xl border bg-card p-4 sm:p-6">
          <h2 className="font-semibold">Topic performance</h2>
          <p className="mb-4 text-sm text-muted-foreground">Percentage correct per topic in this assessment.</p>

          {/* Mobile: horizontal bars so topic names stay readable */}
          <div className="md:hidden" style={{ height: Math.max(220, topics.length * 34) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={100}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <Bar dataKey="score" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Desktop */}
          <div className="hidden h-72 md:block">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      <div className="mb-8 grid gap-6 lg:grid-cols-2 max-w-full">
        <div className="rounded-2xl border bg-card p-4 sm:p-6 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Strengths
          </h2>
          <ul className="space-y-2 text-sm">
            {analysis.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {s}
              </li>
            ))}
            {analysis.strengths.length === 0 && (
              <li className="text-muted-foreground">No strengths detected yet.</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-6 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-primary" /> Weak topics & next actions
          </h2>
          <ul className="space-y-2 text-sm">
            {analysis.weakAreas.map((w) => (
              <li key={w} className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> {w}
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-2 border-t pt-4 text-sm text-muted-foreground">
            {(result.analysis?.recommendations ?? []).map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Question review ({shown.length})</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} className="rounded-xl" onClick={() => setFilter("all")}>
            All questions
          </Button>
          <Button size="sm" variant={filter === "wrong" ? "default" : "outline"} className="rounded-xl" onClick={() => setFilter("wrong")}>
            Incorrect only
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {shown.map((q) => {
          const given = answers[String(q.id)];
          const correct = given === q.correctIndex;
          return (
            <div key={q.id} className="rounded-2xl border bg-card p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Q{q.id}</Badge>
                <Badge variant="outline">{q.type}</Badge>
                <Badge variant="outline">{q.difficulty}</Badge>
                <span className="text-xs text-muted-foreground">{q.topic}</span>
                <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-medium ${correct ? "text-emerald-600" : "text-destructive"}`}>
                  {correct ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {correct ? "Correct" : given === null || given === undefined ? "Skipped" : "Incorrect"}
                </span>
              </div>
              <p className="font-medium">{q.question}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {q.options.map((o, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isGiven = i === given;
                  return (
                    <li
                      key={o}
                      className={`rounded-xl border px-3 py-2 ${
                        isCorrect
                          ? "border-emerald-600/40 bg-emerald-600/10"
                          : isGiven
                            ? "border-destructive/40 bg-destructive/10"
                            : "bg-muted/30"
                      }`}
                    >
                      {o}
                      {isCorrect && <span className="ml-2 text-xs text-emerald-700">Correct answer</span>}
                      {isGiven && !isCorrect && <span className="ml-2 text-xs text-destructive">Your answer</span>}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">{q.explanation}</p>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
