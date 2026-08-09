import { LogoMark } from "@/components/Logo";
import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SelectCard } from "@/components/onboarding/SelectCard";
import { Quiz } from "@/components/onboarding/Quiz";
import { Results } from "@/components/onboarding/Results";
import { AILoadingState } from "@/components/onboarding/AILoadingState";
import { CAREER_DOMAINS, EXPERIENCE_LEVELS, LEARNING_GOALS, WEEKLY_HOURS, domainById } from "@/lib/domains";
import { startAssessment, submitAssessment, completeOnboarding } from "@/lib/onboarding.functions";
import type { OnboardingResult, QuizQuestion } from "@/lib/onboarding-types";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData.session?.user;
    
    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData.user ?? undefined;
    }

    if (!user) throw redirect({ to: "/auth" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.onboarding_completed) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Onboarding · Lumora" },
      { name: "description", content: "Tell Lumora about your career goals and take an adaptive assessment to unlock your personalized learning journey." },
      { property: "og:title", content: "Onboarding · Lumora" },
      { property: "og:description", content: "Build your personalized AI career roadmap in a few minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

type Step = "welcome" | "domain" | "goal" | "level" | "hours" | "quiz" | "results";
const FLOW: Step[] = ["welcome", "domain", "goal", "level", "hours", "quiz", "results"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const start = useServerFn(startAssessment);
  const submit = useServerFn(submitAssessment);
  const complete = useServerFn(completeOnboarding);

  const domain = domainById(domainId);
  const payload = {
    domainId: domainId ?? "",
    domainName: domain?.name ?? "",
    goal: LEARNING_GOALS.find((g) => g.id === goal)?.label ?? "",
    experienceLevel: EXPERIENCE_LEVELS.find((l) => l.id === level)?.label ?? "",
    weeklyHours: hours ?? 5,
  };

  const startMutation = useMutation({
    mutationFn: () => start({ data: payload }),
    onSuccess: (res) => {
      setQuestions(res.questions);
      setStep("quiz");
    },
    onError: (e: Error) => toast.error(e.message || "Could not generate your assessment. Please try again."),
  });

  const submitMutation = useMutation({
    mutationFn: (answers: Record<string, number | null>) => submit({ data: { ...payload, questions, answers } }),
    onSuccess: (res) => {
      setResult(res);
      setStep("results");
      window.scrollTo({ top: 0 });
    },
    onError: (e: Error) => toast.error(e.message || "Analysis failed. Please try submitting again."),
  });

  const finishMutation = useMutation({
    mutationFn: () => complete({}),
    onSuccess: () => {
      toast.success("Your personalized dashboard is ready.");
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message || "Could not finish onboarding."),
  });

  const stepIndex = FLOW.indexOf(step);
  const canContinue =
    (step === "domain" && !!domainId) ||
    (step === "goal" && !!goal) ||
    (step === "level" && !!level) ||
    (step === "hours" && !!hours);

  const back = () => setStep(FLOW[Math.max(0, stepIndex - 1)]!);
  const forward = () => {
    if (step === "hours") startMutation.mutate();
    else setStep(FLOW[stepIndex + 1]!);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <LogoMark className="h-7 w-7" />
            <span className="font-display font-bold tracking-[0.14em]">LUMORA</span>
          </div>
          {step !== "welcome" && step !== "results" && (
            <div className="flex-1 max-w-xs">
              <Progress value={(stepIndex / (FLOW.length - 1)) * 100} className="h-1.5" />
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {step === "results" ? "Complete" : `Step ${Math.max(1, stepIndex)} of ${FLOW.length - 2}`}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {startMutation.isPending ? (
          <AILoadingState mode="generating" domainName={domain?.name} />
        ) : submitMutation.isPending ? (
          <AILoadingState mode="analyzing" domainName={domain?.name} />
        ) : (
          <>
            {step === "welcome" && (
              <div className="mx-auto max-w-2xl text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
                <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Personalized in ~10 minutes
                </span>
                <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">Welcome to Lumora</h1>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  Let's understand your career goals to build your personalized learning journey.
                </p>
                <Button size="lg" className="mt-8 rounded-xl px-8" onClick={() => setStep("domain")}>
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === "domain" && (
              <StepShell
                title="Choose your career domain"
                subtitle="Pick one. Everything in Lumora — assessments, roadmap, certifications and projects — adapts to this choice."
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {CAREER_DOMAINS.map((d) => {
                    const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[d.icon] ?? Icons.Sparkles;
                    return (
                      <SelectCard
                        key={d.id}
                        selected={domainId === d.id}
                        onSelect={() => setDomainId(d.id)}
                        icon={<Icon className="h-5 w-5" />}
                        title={d.name}
                        description={d.description}
                        meta={`Typical path: ${d.time}`}
                      />
                    );
                  })}
                </div>
              </StepShell>
            )}

            {step === "goal" && (
              <StepShell title="What's your learning goal?" subtitle="We'll tune the depth and pace of your roadmap to match it.">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {LEARNING_GOALS.map((g) => (
                    <SelectCard key={g.id} selected={goal === g.id} onSelect={() => setGoal(g.id)} title={g.label} description={g.description} />
                  ))}
                </div>
              </StepShell>
            )}

            {step === "level" && (
              <StepShell title="What's your experience level?" subtitle="This sets the starting difficulty of your adaptive assessment.">
                <div className="grid gap-4 sm:grid-cols-3">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <SelectCard key={l.id} selected={level === l.id} onSelect={() => setLevel(l.id)} title={l.label} description={l.description} />
                  ))}
                </div>
              </StepShell>
            )}

            {step === "hours" && (
              <StepShell title="How many hours can you study weekly?" subtitle="Your 12-week roadmap will be scheduled around this commitment.">
                <div className="grid gap-4 sm:grid-cols-4">
                  {WEEKLY_HOURS.map((h) => (
                    <SelectCard
                      key={h}
                      selected={hours === h}
                      onSelect={() => setHours(h)}
                      title={h === 20 ? "20+ Hours" : `${h} Hours`}
                      description={h <= 5 ? "Light and steady" : h <= 10 ? "Balanced pace" : h <= 15 ? "Serious momentum" : "Full immersion"}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {step === "quiz" && questions.length > 0 && (
              <Quiz questions={questions} submitting={submitMutation.isPending} onSubmit={(a) => submitMutation.mutate(a)} />
            )}

            {step === "results" && result && (
              <Results result={result} finishing={finishMutation.isPending} onFinish={() => finishMutation.mutate()} />
            )}

            {["domain", "goal", "level", "hours"].includes(step) && (
              <div className="mx-auto mt-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-6xl">
                <Button variant="ghost" onClick={back} disabled={startMutation.isPending} className="w-full sm:w-auto rounded-xl justify-center">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
                <Button onClick={forward} disabled={!canContinue || startMutation.isPending} className="w-full sm:w-auto rounded-xl px-6 text-xs sm:text-sm justify-center gradient-primary text-white shadow-md shadow-primary/20">
                  {step === "hours" ? (
                    <>
                      Start AI assessment <Sparkles className="h-4 w-4 ml-1.5" />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
