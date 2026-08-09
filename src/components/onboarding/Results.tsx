import { useState } from "react";
import {
  Award,
  BadgeCheck,
  Brain,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MinusCircle,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { OnboardingResult } from "@/lib/onboarding-types";

export function Results({
  result,
  finishing,
  onFinish,
}: {
  result: OnboardingResult;
  finishing: boolean;
  onFinish: () => void;
}) {
  const [tab, setTab] = useState("analysis");
  const topicScores = result.analysis?.topicScores ?? [];
  const skipped = result.questions.filter(
    (q) => result.answers[String(q.id)] === null || result.answers[String(q.id)] === undefined,
  ).length;
  const wrong = result.total - result.score - skipped;

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI analysis complete
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">Your personalized results</h1>
        <p className="mt-2 text-muted-foreground">Everything below is generated from your assessment and career goals.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <ScoreCard label="Overall Score" value={`${result.score} / ${result.total}`} icon={<Target className="h-4 w-4" />} />
        <ScoreCard label="Percentage" value={`${result.percentage}%`} icon={<TrendingUp className="h-4 w-4" />} />
        <ScoreCard label="Skill Level" value={result.skill_level ?? "—"} icon={<Brain className="h-4 w-4" />} />
        <ScoreCard label="Accuracy Split" value={`${result.score}✓ ${wrong}✗ ${skipped}–`} icon={<BadgeCheck className="h-4 w-4" />} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap h-auto">
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="review">Question Review</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Topic performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {topicScores.length >= 3 ? (
                    <RadarChart data={topicScores} outerRadius="75%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
                      <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                      <Tooltip />
                    </RadarChart>
                  ) : (
                    <BarChart data={topicScores}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Topic breakdown</h3>
              <div className="space-y-4">
                {topicScores.map((t) => (
                  <div key={t.topic}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{t.topic}</span>
                      <span className="text-muted-foreground">{t.score}%</span>
                    </div>
                    <Progress value={t.score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI summary
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.analysis?.summary}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ListCard title="Strengths" tone="good" items={result.analysis?.strengths ?? []} />
            <ListCard title="Weak areas" tone="bad" items={result.analysis?.weakAreas ?? []} />
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Personalized recommendations</h3>
            <ul className="space-y-3">
              {(result.analysis?.recommendations ?? []).map((r, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-4">
          {result.questions.map((q) => {
            const given = result.answers[String(q.id)];
            const isSkipped = given === null || given === undefined;
            const isCorrect = !isSkipped && given === q.correctIndex;
            return (
              <div
                key={q.id}
                className={cn(
                  "rounded-2xl border p-5",
                  isCorrect && "border-emerald-500/40 bg-emerald-500/5",
                  !isCorrect && !isSkipped && "border-destructive/40 bg-destructive/5",
                  isSkipped && "bg-card",
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline">Q{q.id}</Badge>
                  <Badge variant="secondary">{q.type}</Badge>
                  <Badge variant="outline">{q.topic}</Badge>
                  <Badge variant="secondary">{q.difficulty}</Badge>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1.5 text-xs font-medium",
                      isCorrect ? "text-emerald-600" : isSkipped ? "text-muted-foreground" : "text-destructive",
                    )}
                  >
                    {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : isSkipped ? <MinusCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {isCorrect ? "Correct" : isSkipped ? "Skipped" : "Wrong"}
                  </span>
                </div>
                <div className="font-medium mb-3">{q.question}</div>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className={cn("rounded-lg border px-3 py-2", isCorrect ? "border-emerald-500/40" : isSkipped ? "" : "border-destructive/40")}>
                    <span className="text-muted-foreground">Your answer: </span>
                    {isSkipped ? "Skipped" : q.options[given as number]}
                  </div>
                  <div className="rounded-lg border border-emerald-500/40 px-3 py-2">
                    <span className="text-muted-foreground">Correct answer: </span>
                    {q.options[q.correctIndex]}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{q.explanation}</p>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {result.roadmap.map((w) => (
              <div key={w.week} className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Badge>Week {w.week}</Badge>
                  <span className="text-xs text-muted-foreground">{w.hours} hrs</span>
                </div>
                <h4 className="font-semibold">{w.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{w.focus}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(w.topics ?? []).map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
                {w.outcome && <p className="mt-3 text-xs text-primary">Outcome: {w.outcome}</p>}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {result.certifications.map((c) => (
              <div key={c.name} className="rounded-2xl border bg-card p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Award className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-semibold leading-tight">{c.name}</h4>
                    <div className="text-xs text-muted-foreground">{c.provider}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground flex-1">{c.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{c.difficulty}</Badge>
                  <Badge variant="outline">{c.duration}</Badge>
                  <Button asChild size="sm" variant="outline" className="ml-auto">
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      Learn <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {result.projects.map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Rocket className="h-4 w-4" />
                  </span>
                  <Badge variant="secondary">{p.level}</Badge>
                </div>
                <h4 className="font-semibold">{p.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{p.problem}</p>
                <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Objectives</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {(p.objectives ?? []).map((o) => (
                    <li key={o} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {o}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(p.stack ?? []).map((s) => (
                    <Badge key={s} variant="outline" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Estimated time: {p.time}</div>
                {(p.outcomes ?? []).length > 0 && (
                  <p className="mt-2 text-xs text-primary">You'll learn: {p.outcomes.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 flex justify-center">
        <Button size="lg" onClick={onFinish} disabled={finishing} className="rounded-xl px-8">
          {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Build my dashboard
        </Button>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: "good" | "bad" }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2.5">
            {tone === "good" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            )}
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
