import { callAIJson } from "./ai.server";
import type {
  Analysis,
  CertificationRec,
  ProjectRec,
  QuizQuestion,
  RoadmapWeek,
} from "./onboarding-types";

export async function generateQuestions(input: {
  domainName: string;
  experienceLevel: string;
  goal: string;
  attempt?: number;
}): Promise<QuizQuestion[]> {
  try {
    const data = await callAIJson<{ questions: QuizQuestion[] }>({
      system:
        "You are an expert technical assessor. You always answer with strict JSON only, no prose.",
      prompt: `Create a 20-question adaptive assessment for someone pursuing the career domain "${input.domainName}".
Their self-declared level is "${input.experienceLevel}" and their goal is "${input.goal}".

Rules:
- Questions must be highly specific to "${input.domainName}". Do NOT use generic questions that could apply to any domain.
- Mix these types: "MCQ", "Scenario", "Logical", "Practical", "Fundamentals".
- Adaptive difficulty: start easier, ramp up. Use "Easy", "Medium", "Hard".
- Exactly 4 options per question, exactly one correct.
- Cover at least 8 distinct topics of the domain.
- Explanations must be 1-2 sentences and teach the concept.

Return JSON: {"questions":[{"id":1,"question":"...","type":"MCQ","topic":"...","difficulty":"Easy","options":["a","b","c","d"],"correctIndex":0,"explanation":"..."}]}
Return exactly 20 questions with ids 1..20.`,
    });

    const questions = (data.questions ?? [])
      .filter((q) => Array.isArray(q.options) && q.options.length === 4)
      .slice(0, 20)
      .map((q, i) => ({
        ...q,
        id: i + 1,
        correctIndex: Math.max(0, Math.min(3, Number(q.correctIndex) || 0)),
      }));

    if (questions.length < 5) throw new Error("Could not generate the assessment. Please retry.");
    return questions;
  } catch (error) {
    // If AI fails or is not configured, use fallback questions
    const { generateFallbackQuestions } = await import("./fallback-questions");
    return generateFallbackQuestions(input.domainName, input.experienceLevel, input.attempt || 0);
  }
}

export function scoreQuiz(questions: QuizQuestion[], answers: Record<string, number | null>) {
  let score = 0;
  const perTopic: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const given = answers[String(q.id)];
    const correct = given !== null && given !== undefined && given === q.correctIndex;
    if (correct) score += 1;
    const t = (perTopic[q.topic] ??= { correct: 0, total: 0 });
    t.total += 1;
    if (correct) t.correct += 1;
  }
  const total = questions.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const topicScores = Object.entries(perTopic).map(([topic, v]) => ({
    topic,
    score: Math.round((v.correct / v.total) * 100),
  }));
  const skillLevel = percentage >= 75 ? "Advanced" : percentage >= 45 ? "Intermediate" : "Beginner";
  return { score, total, percentage, topicScores, skillLevel };
}

export async function generatePlan(input: {
  domainName: string;
  goal: string;
  experienceLevel: string;
  weeklyHours: number;
  percentage: number;
  skillLevel: string;
  topicScores: { topic: string; score: number }[];
}): Promise<{
  analysis: Omit<Analysis, "topicScores">;
  roadmap: RoadmapWeek[];
  certifications: CertificationRec[];
  projects: ProjectRec[];
}> {
  try {
    const data = await callAIJson<{
      analysis: Omit<Analysis, "topicScores">;
      roadmap: RoadmapWeek[];
      certifications: CertificationRec[];
      projects: ProjectRec[];
    }>({
      system:
        "You are a senior career coach and curriculum designer. You always answer with strict JSON only, no prose.",
      prompt: `Learner profile:
- Career domain: ${input.domainName}
- Goal: ${input.goal}
- Self-declared level: ${input.experienceLevel}
- Weekly study time: ${input.weeklyHours} hours
- Assessment score: ${input.percentage}% (measured level: ${input.skillLevel})
- Per-topic results: ${JSON.stringify(input.topicScores)}

Produce a fully personalized plan for THIS domain only.

Return JSON with this exact shape:
{
 "analysis": {
   "summary": "3-4 sentence honest AI summary of strengths and gaps",
   "strengths": ["..."],
   "weakAreas": ["..."],
   "recommendations": ["5 concrete next actions"]
 },
 "roadmap": [{"week":1,"title":"...","focus":"...","topics":["..."],"hours":${input.weeklyHours},"outcome":"..."}],
 "certifications": [{"name":"...","provider":"...","description":"...","difficulty":"Beginner|Intermediate|Advanced","duration":"...","url":"https://official-site"}],
 "projects": [{"title":"...","level":"Beginner|Intermediate|Advanced","problem":"...","objectives":["..."],"stack":["..."],"time":"...","outcomes":["..."]}]
}

Requirements:
- roadmap: 12 sequential weeks sized to ${input.weeklyHours} hours/week, front-loading the weak topics.
- certifications: 4-6 REAL, official certifications relevant only to ${input.domainName}, with real official URLs.
- projects: 6 projects spanning the learner's level and one step above, each targeting weak topics.`,
    });

    return {
      analysis: data.analysis,
      roadmap: data.roadmap ?? [],
      certifications: data.certifications ?? [],
      projects: data.projects ?? [],
    };
  } catch (error) {
    return {
      analysis: {
        summary: `This is a default generic analysis because AI is not configured. Based on your score of ${input.percentage}%, your current skill level is ${input.skillLevel}.`,
        strengths: ["Strong foundational knowledge", "Eagerness to learn"],
        weakAreas: ["Advanced domain-specific tools", "Deep architectural patterns"],
        recommendations: [
          `Focus on building projects in ${input.domainName}.`,
          "Follow industry best practices and study established architectures.",
          "Contribute to open source or collaborate on real-world projects."
        ]
      },
      roadmap: Array.from({ length: 12 }).map((_, i) => ({
        week: i + 1,
        title: `Week ${i + 1} of ${input.domainName}`,
        focus: "Fundamentals and Practice",
        topics: ["Core Concepts", "Building small modules"],
        hours: input.weeklyHours,
        outcome: "Understanding foundational concepts."
      })),
      certifications: [
        {
          name: `${input.domainName} Certified Associate`,
          provider: "Tech Council",
          description: "An industry-standard certification for foundational knowledge.",
          difficulty: "Beginner",
          duration: "3 months",
          url: "https://example.com/cert"
        }
      ],
      projects: [
        {
          title: `${input.domainName} Starter Project`,
          level: "Beginner",
          problem: "Applying basic knowledge",
          objectives: ["Set up environment", "Build a small feature"],
          stack: ["Basic Tools"],
          time: "2 weeks",
          outcomes: ["A working prototype"]
        }
      ]
    };
  }
}
