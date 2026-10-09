CREATE TABLE public.project_analyses (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  goal text NOT NULL DEFAULT '',
  understood_facts jsonb NOT NULL DEFAULT '[]',
  assumptions jsonb NOT NULL DEFAULT '[]',
  missing_info jsonb NOT NULL DEFAULT '[]',
  contradictions jsonb NOT NULL DEFAULT '[]',
  todo_items jsonb NOT NULL DEFAULT '[]',
  version integer NOT NULL DEFAULT 1,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.project_analyses TO authenticated;
GRANT ALL ON public.project_analyses TO service_role;
ALTER TABLE public.project_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own analysis read" ON public.project_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own analysis insert" ON public.project_analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Own analysis update" ON public.project_analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER project_analyses_touch BEFORE UPDATE ON public.project_analyses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();