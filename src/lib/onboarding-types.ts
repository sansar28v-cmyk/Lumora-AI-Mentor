export type QuizQuestion = {
  id: number;
  question: string;
  type: "MCQ" | "Scenario" | "Logical" | "Practical" | "Fundamentals";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type RoadmapWeek = {
  week: number;
  title: string;
  focus: string;
  topics: string[];
  hours: number;
  outcome: string;
};

export type CertificationRec = {
  name: string;
  provider: string;
  description: string;
  difficulty: string;
  duration: string;
  url: string;
};

export type ProjectRec = {
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  problem: string;
  objectives: string[];
  stack: string[];
  time: string;
  outcomes: string[];
};

export type Analysis = {
  summary: string;
  strengths: string[];
  weakAreas: string[];
  recommendations: string[];
  topicScores: { topic: string; score: number }[];
};

export type OnboardingResult = {
  id: string;
  career_domain: string;
  learning_goal: string | null;
  experience_level: string | null;
  weekly_hours: number | null;
  questions: QuizQuestion[];
  answers: Record<string, number | null>;
  score: number;
  total: number;
  percentage: number;
  skill_level: string | null;
  analysis: Analysis;
  roadmap: RoadmapWeek[];
  certifications: CertificationRec[];
  projects: ProjectRec[];
};

export type OnboardingProfile = {
  full_name: string | null;
  career_domain: string | null;
  learning_goal: string | null;
  experience_level: string | null;
  weekly_hours: number | null;
  skill_level: string | null;
  readiness_score: number | null;
  onboarding_completed: boolean;
};
