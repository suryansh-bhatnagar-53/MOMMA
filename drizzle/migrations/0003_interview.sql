CREATE TABLE public.interview_sessions (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  is_paused boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.interview_sessions TO authenticated;
GRANT ALL ON public.interview_sessions TO service_role;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own session read" ON public.interview_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own session insert" ON public.interview_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Own session update" ON public.interview_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER interview_sessions_touch BEFORE UPDATE ON public.interview_sessions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  ord double precision NOT NULL,
  text text NOT NULL,
  kind text NOT NULL DEFAULT 'gap',
  source text,
  answer_text text,
  is_clarification_needed boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interview_questions_project_idx ON public.interview_questions(project_id, ord);
GRANT SELECT, INSERT, UPDATE ON public.interview_questions TO authenticated;
GRANT ALL ON public.interview_questions TO service_role;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own questions read" ON public.interview_questions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own questions insert" ON public.interview_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Own questions update" ON public.interview_questions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);