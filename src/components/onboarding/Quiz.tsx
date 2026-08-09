import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Loader2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/onboarding-types";

export function Quiz({
  questions,
  submitting,
  onSubmit,
}: {
  questions: QuizQuestion[];
  submitting: boolean;
  onSubmit: (answers: Record<string, number | null>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const q = questions[index]!;
  const answered = useMemo(
    () => Object.values(answers).filter((v) => v !== null && v !== undefined).length,
    [answers],
  );
  const last = index === questions.length - 1;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const setAnswer = (value: number | null) =>
    setAnswers((prev) => ({ ...prev, [String(q.id)]: value }));

  const next = () => (last ? onSubmit(answers) : setIndex((i) => i + 1));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-sm font-medium">
          Question {index + 1}
          <span className="text-muted-foreground"> / {questions.length}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{answered} answered</span>
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Clock className="h-3.5 w-3.5" />
            {mm}:{ss}
          </span>
        </div>
      </div>
      <Progress value={((index + 1) / questions.length) * 100} className="h-2 mb-6" />

      <div key={q.id} className="rounded-2xl border bg-card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary">{q.type}</Badge>
          <Badge variant="outline">{q.topic}</Badge>
          <Badge
            className={cn(
              q.difficulty === "Hard" && "bg-destructive/10 text-destructive",
              q.difficulty === "Medium" && "bg-amber-500/10 text-amber-600",
              q.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-600",
            )}
            variant="secondary"
          >
            {q.difficulty}
          </Badge>
        </div>

        <h2 className="text-lg md:text-xl font-semibold leading-snug whitespace-pre-wrap">{q.question}</h2>

        <div className="mt-6 space-y-3">
          {q.options.map((opt, i) => {
            const active = answers[String(q.id)] === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setAnswer(i)}
                className={cn(
                  "w-full text-left rounded-xl border px-4 py-3.5 text-sm transition-all flex items-start gap-3",
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                    active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="whitespace-pre-wrap">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || submitting}
          className="w-full sm:w-auto rounded-xl justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Previous
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              setAnswer(null);
              next();
            }}
            disabled={submitting}
            className="rounded-xl px-3 sm:px-4 text-xs sm:text-sm"
          >
            <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Skip
          </Button>

          <Button
            onClick={next}
            disabled={submitting}
            className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 text-xs sm:text-sm justify-center gradient-primary text-white shadow-md shadow-primary/20"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Analyzing…
              </>
            ) : last ? (
              "Submit assessment"
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
