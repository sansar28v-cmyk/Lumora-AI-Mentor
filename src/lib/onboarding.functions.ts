import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { OnboardingProfile, OnboardingResult, QuizQuestion } from "./onboarding-types";

export const startAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      domainId: string;
      domainName: string;
      goal: string;
      experienceLevel: string;
      weeklyHours: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("onboarding_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", context.userId);
    const attempt = count || 0;

    const { generateQuestions } = await import("./onboarding.server");
    const questions = await generateQuestions({
      domainName: data.domainName,
      experienceLevel: data.experienceLevel,
      goal: data.goal,
      attempt,
    });

    await context.supabase
      .from("profiles")
      .update({
        career_domain: data.domainId,
        learning_goal: data.goal,
        experience_level: data.experienceLevel,
        weekly_hours: data.weeklyHours,
      })
      .eq("id", context.userId);

    return { questions };
  });

export const submitAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      domainId: string;
      domainName: string;
      goal: string;
      experienceLevel: string;
      weeklyHours: number;
      questions: QuizQuestion[];
      answers: Record<string, number | null>;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { scoreQuiz, generatePlan } = await import("./onboarding.server");
    const scored = scoreQuiz(data.questions, data.answers);
    const plan = await generatePlan({
      domainName: data.domainName,
      goal: data.goal,
      experienceLevel: data.experienceLevel,
      weeklyHours: data.weeklyHours,
      percentage: scored.percentage,
      skillLevel: scored.skillLevel,
      topicScores: scored.topicScores,
    });

    const analysis = { ...plan.analysis, topicScores: scored.topicScores };
    const readiness = Math.round(scored.percentage * 0.7 + (scored.topicScores.length ? 15 : 0));

    const { data: inserted, error } = await context.supabase
      .from("onboarding_results")
      .insert({
        user_id: context.userId,
        career_domain: data.domainId,
        learning_goal: data.goal,
        experience_level: data.experienceLevel,
        weekly_hours: data.weeklyHours,
        questions: data.questions as unknown as never,
        answers: data.answers as unknown as never,
        score: scored.score,
        total: scored.total,
        percentage: scored.percentage,
        skill_level: scored.skillLevel,
        analysis: analysis as unknown as never,
        roadmap: plan.roadmap as unknown as never,
        certifications: plan.certifications as unknown as never,
        projects: plan.projects as unknown as never,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await context.supabase
      .from("profiles")
      .update({
        career_domain: data.domainId,
        learning_goal: data.goal,
        experience_level: data.experienceLevel,
        weekly_hours: data.weeklyHours,
        skill_level: scored.skillLevel,
        readiness_score: readiness,
      })
      .eq("id", context.userId);

    return inserted as unknown as OnboardingResult;
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: results }] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase
        .from("onboarding_results")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    return {
      profile: (profile ?? null) as unknown as OnboardingProfile | null,
      result: (results?.[0] ?? null) as unknown as OnboardingResult | null,
    };
  });
