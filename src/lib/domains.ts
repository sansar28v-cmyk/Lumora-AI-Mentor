export type CareerDomain = {
  id: string;
  name: string;
  description: string;
  time: string;
  icon: string;
};

export const CAREER_DOMAINS: CareerDomain[] = [
  { id: "full-stack", name: "Full Stack Developer", description: "Build complete web products across frontend, backend and databases.", time: "6–9 months", icon: "Layers" },
  { id: "frontend", name: "Frontend Developer", description: "Craft fast, accessible and beautiful user interfaces.", time: "4–6 months", icon: "MonitorSmartphone" },
  { id: "backend", name: "Backend Developer", description: "Design APIs, databases and scalable server systems.", time: "5–8 months", icon: "Server" },
  { id: "mobile", name: "Mobile App Developer", description: "Ship native and cross-platform apps for iOS and Android.", time: "5–7 months", icon: "Smartphone" },
  { id: "ai-engineer", name: "AI Engineer", description: "Build LLM apps, RAG systems and production AI services.", time: "6–10 months", icon: "Sparkles" },
  { id: "ml-engineer", name: "Machine Learning Engineer", description: "Train, evaluate and deploy ML models at scale.", time: "8–12 months", icon: "Brain" },
  { id: "data-scientist", name: "Data Scientist", description: "Turn data into models, experiments and business insight.", time: "7–10 months", icon: "LineChart" },
  { id: "data-analyst", name: "Data Analyst", description: "Analyze data with SQL, BI tools and storytelling dashboards.", time: "3–5 months", icon: "BarChart3" },
  { id: "cybersecurity", name: "Cybersecurity Engineer", description: "Defend systems, hunt threats and secure infrastructure.", time: "7–10 months", icon: "ShieldCheck" },
  { id: "cloud", name: "Cloud Engineer", description: "Architect resilient workloads on AWS, Azure and GCP.", time: "5–8 months", icon: "Cloud" },
  { id: "devops", name: "DevOps Engineer", description: "Automate CI/CD, containers, IaC and observability.", time: "6–9 months", icon: "Infinity" },
  { id: "ui-ux", name: "UI/UX Designer", description: "Design research-driven, high-craft product experiences.", time: "4–6 months", icon: "PenTool" },
  { id: "software-engineer", name: "Software Engineer", description: "Master DSA, system design and production engineering.", time: "8–12 months", icon: "Code2" },
  { id: "blockchain", name: "Blockchain Developer", description: "Write smart contracts and decentralized applications.", time: "6–9 months", icon: "Blocks" },
  { id: "embedded", name: "Embedded Systems Engineer", description: "Program microcontrollers, RTOS and hardware interfaces.", time: "7–10 months", icon: "Cpu" },
  { id: "game-dev", name: "Game Developer", description: "Build games with engines, graphics and gameplay systems.", time: "7–10 months", icon: "Gamepad2" },
  { id: "ar-vr", name: "AR/VR Developer", description: "Create immersive spatial experiences and 3D interactions.", time: "6–9 months", icon: "Glasses" },
];

export const LEARNING_GOALS = [
  { id: "job", label: "Get a Job", description: "Land a full-time role" },
  { id: "internship", label: "Internship", description: "Secure an internship" },
  { id: "placement", label: "Placement Preparation", description: "Crack campus placements" },
  { id: "career-switch", label: "Career Switch", description: "Move into a new field" },
  { id: "freelancing", label: "Freelancing", description: "Win client projects" },
  { id: "higher-studies", label: "Higher Studies", description: "Prepare for masters/research" },
  { id: "startup", label: "Startup", description: "Build my own product" },
  { id: "personal", label: "Personal Interest", description: "Learn for curiosity" },
];

export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", description: "New to this domain, learning the basics." },
  { id: "intermediate", label: "Intermediate", description: "Comfortable building small projects." },
  { id: "advanced", label: "Advanced", description: "Working on complex, production-grade work." },
];

export const WEEKLY_HOURS = [5, 10, 15, 20];

export function domainById(id?: string | null) {
  return CAREER_DOMAINS.find((d) => d.id === id) ?? null;
}
