import { useEffect, useState } from "react";
import { Brain, Sparkles, Target, Zap, Award, Compass, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type LoadingMode = "generating" | "analyzing";

const MESSAGES: Record<LoadingMode, { text: string; icon: any }[]> = {
  generating: [
    { text: "Analyzing your track & experience level...", icon: Compass },
    { text: "Formulating 20 adaptive domain scenarios...", icon: Brain },
    { text: "Calibrating difficulty vectors for precision...", icon: Target },
    { text: "Synthesizing diagnostic assessment suite...", icon: Sparkles },
  ],
  analyzing: [
    { text: "Scoring response patterns across core competencies...", icon: Zap },
    { text: "Identifying verified strengths & growth focus areas...", icon: Target },
    { text: "Matching top industry certifications to your profile...", icon: Award },
    { text: "Synthesizing your 12-week personalized career roadmap...", icon: Sparkles },
  ],
};

const TIPS = [
  "💡 High-performing engineers focus on system design and clean abstractions early in their track.",
  "⚡ Adaptive assessments adjust question difficulty in real time based on your conceptual precision.",
  "🎯 Consistency compounds: dedicating just 10 hours a week builds 500+ hours of mastery in a year.",
  "🚀 Lumora's roadmap adapts to your weekly schedule, ensuring steady momentum without burnout.",
];

export function AILoadingState({
  mode,
  domainName,
}: {
  mode: LoadingMode;
  domainName?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [tipIndex, setTipIndex] = useState(0);

  const steps = MESSAGES[mode];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 2400);

    const tipInterval = setInterval(() => {
      setTipIndex((t) => (t + 1) % TIPS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        return p + Math.floor(Math.random() * 8 + 3);
      });
    }, 450);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  const CurrentIcon = steps[stepIndex]!.icon;

  return (
    <div className="mx-auto my-4 sm:my-8 w-full max-w-xl px-2 sm:px-0 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative rounded-2xl sm:rounded-3xl border border-primary/20 bg-card/95 backdrop-blur-2xl p-5 sm:p-8 md:p-10 shadow-[0_20px_60px_-15px_color-mix(in_oklab,var(--primary)_25%,transparent)] text-center overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 sm:h-56 sm:w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 sm:h-56 sm:w-56 rounded-full bg-primary/15 blur-3xl" />

        {/* Central Animated Pulse Radar */}
        <div className="relative mx-auto mb-6 sm:mb-8 grid place-items-center h-20 w-20 sm:h-28 sm:w-28">
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-25" />
          <div className="absolute inset-2 rounded-full border border-primary/40 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 backdrop-blur" />
          <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl gradient-primary text-white grid place-items-center shadow-xl shadow-primary/30">
            <CurrentIcon className="h-6 w-6 sm:h-8 sm:w-8 animate-bounce duration-1000" />
          </div>
        </div>

        {/* Header & Badges */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 inline" /> Lumora AI Engine
            </Badge>
            {domainName && <Badge variant="outline" className="text-[11px] sm:text-xs max-w-[180px] truncate">{domainName}</Badge>}
          </div>

          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground px-1">
            {mode === "generating" ? "Formulating Your Assessment" : "Analyzing Your Results & Roadmap"}
          </h2>
        </div>

        {/* Step Statement Indicator */}
        <div className="my-5 sm:my-6 min-h-[44px] sm:min-h-[48px] flex items-center justify-center gap-2 text-xs sm:text-sm text-foreground/90 font-medium px-2 sm:px-4">
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] sm:text-xs">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
          <span className="animate-fade-in text-center sm:text-left leading-tight">
            {steps[stepIndex]!.text}
          </span>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-muted-foreground px-1">
            <span>AI Synthesis Progress</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 sm:h-2.5 rounded-full bg-muted/60" />
        </div>

        {/* Interactive Tip Cards Carousel */}
        <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/40 p-3.5 sm:p-4 text-left backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-1 sm:gap-3">
            <div className="shrink-0 text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider">
              Track Tip
            </div>
            <p className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground transition-all duration-500 min-h-[32px] sm:min-h-[36px]">
              {TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
