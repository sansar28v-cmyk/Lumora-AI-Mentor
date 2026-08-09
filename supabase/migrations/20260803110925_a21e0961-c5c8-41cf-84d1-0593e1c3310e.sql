ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS career_domain text,
  ADD COLUMN IF NOT EXISTS learning_goal text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS weekly_hours integer,
  ADD COLUMN IF NOT EXISTS skill_level text,
  ADD COLUMN IF NOT EXISTS readiness_score integer,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.onboarding_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_domain text NOT NULL,
  learning_goal text,
  experience_level text,
  weekly_hours integer,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 20,
  percentage integer NOT NULL DEFAULT 0,
  skill_level text,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  roadmap jsonb NOT NULL DEFAULT '[]'::jsonb,
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_results TO authenticated;
GRANT ALL ON public.onboarding_results TO service_role;

ALTER TABLE public.onboarding_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onboarding results"
ON public.onboarding_results FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER onboarding_results_set_updated_at
BEFORE UPDATE ON public.onboarding_results
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS onboarding_results_user_id_idx ON public.onboarding_results(user_id);