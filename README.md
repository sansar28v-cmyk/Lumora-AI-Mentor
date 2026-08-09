# 🚀 Lumora — AI-Powered Career Intelligence & Learning Acceleration Platform

> **Your AI co-pilot for a career that compounds.**  
> Lumora transforms career guidance by combining personalized 12-week AI roadmaps, adaptive domain assessments, curated industry certifications, and mentor-tutor connections in a single, high-craft workspace.

---

## 🌟 Key Features

### 🧠 Personalized AI Career Roadmaps
- **17 Specialized Tech Tracks**: Full Stack, AI Engineer, Machine Learning, Frontend, Backend, Mobile, Data Science, Data Analyst, DevOps, Cloud, Cybersecurity, UI/UX, Software Engineering, Blockchain, Embedded Systems, Game Dev, and AR/VR.
- **Dynamic 12-Week Milestones**: Actionable weekly tasks, focus topics, estimated hours, and concrete project outcomes tailored to your experience level and goal.

### 🎯 Adaptive Skill Assessments
- **AI-Powered Diagnostics**: 20-question adaptive quizzes spanning fundamentals, scenario-based problem solving, logical reasoning, and practical implementations.
- **Deep Performance Analysis**: Real-time readiness scoring (0–100%), verified strength highlights, focus area breakdowns, and topic-level mastery scores.

### 🏆 Industry Certifications & Project Hub
- **Curated Certification Paths**: Matched recommendations for top industry certifications (AWS, Google Cloud, Microsoft Azure, Meta, Coursera, IBM AI, TensorFlow).
- **Hands-On Project Hub**: Production-grade project briefs with beginner, intermediate, and advanced tech stacks.

### 👨‍🏫 Tutor Connect & Professional Invitations
- **Verified Mentor Directory**: Connect with registered tutors matching your specific career track.
- **Email Invitation System**: Formatted email dispatch and direct link referral system allowing learners to invite professors, industry mentors, or code reviewers to guide their journey.

### 🔐 Enterprise-Grade Authentication & Theme Control
- **Flexible Auth Options**: Email & password authentication with Google OAuth and GitHub OAuth integration via Supabase Auth.
- **Adaptive Theme System**: Seamless dark and light modes with glassmorphic aesthetics, responsive mobile drawer/popover navigation, and micro-interactions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Routing & State** | [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router), [TanStack Query v5](https://tanstack.com/query) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI Primitives](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [Sonner Toasts](https://sonner.emilkowal.ski/) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS Security) |
| **AI Engine** | [OpenRouter AI / LLM Gateway](https://openrouter.ai/) (DeepSeek R1, Llama 3) |
| **Build & Tooling** | [Vite 8](https://vitejs.dev/), ESLint 9, Prettier |

---

## 📁 Project Structure

```text
Lumora/
├── src/
│   ├── components/             # Reusable UI Primitives & App Layout
│   │   ├── ui/                 # Radix UI styled components (Select, Dialog, Tabs, etc.)
│   │   ├── AppLayout.tsx       # Main navigation header, drawer, notifications & theme toggle
│   │   ├── Footer.tsx          # Full & compact footer with social links
│   │   └── page-states.tsx     # Page loaders, intros, and empty states
│   ├── integrations/
│   │   └── supabase/           # Supabase client, auth middleware, and auto-generated types
│   ├── lib/
│   │   ├── ai.server.ts        # OpenRouter AI integration service
│   │   ├── app.functions.ts    # Server functions for profile, tutors & invites
│   │   ├── domains.ts          # 17 Career domain definitions & goals
│   │   ├── fallback-questions.ts# Assessment question pool & fallback logic
│   │   └── onboarding-types.ts # TypeScript interfaces for roadmaps, quizzes & profiles
│   └── routes/                 # File-based router using TanStack Router
│       ├── _authenticated/     # Protected application routes (Dashboard, Roadmap, Profile, etc.)
│       ├── auth.tsx            # Sign in / Sign up page with Google & GitHub OAuth
│       ├── onboarding.tsx      # Adaptive multi-step onboarding & assessment flow
│       └── index.tsx           # Public landing page
├── .lumora/                    # Lumora project configuration
├── public/                     # Static assets & favicon
└── package.json                # Dependencies and build scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/sansar28v-cmyk/Lumora.git
cd Lumora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://YOUR-SUPABASE-PROJECT-REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_YOUR_KEY"
SUPABASE_URL="https://YOUR-SUPABASE-PROJECT-REF.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_YOUR_KEY"

# AI Service Gateway
OPENROUTER_API_KEY="sk-or-v1-YOUR-API-KEY"
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) (or `http://localhost:3000`) in your browser.

---

## ⚙️ Development Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Builds production bundle |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs ESLint code quality checks |
| `npm run format` | Formats codebase with Prettier |

---

## 🔗 Socials & Support

- **Author**: Sandeep V
- **GitHub**: [github.com/sansar28v-cmyk](https://github.com/sansar28v-cmyk)
- **LinkedIn**: [linkedin.com/in/sandeep-v-5b7351375](https://www.linkedin.com/in/sandeep-v-5b7351375)
- **Instagram**: [instagram.com/peace._.ig](https://www.instagram.com/peace._.ig?igsh=bTM5dHRqbXBkY3Fi)

---

© 2026 **Lumora**. Designed & developed by **Sandeep V**. All rights reserved.
