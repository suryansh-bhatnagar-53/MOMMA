-- Batch 4: generated bot packages, one immutable row per generation (v1, v2, …).
-- Run once in Supabase → SQL Editor. All-or-nothing.
BEGIN;

CREATE TABLE public.bot_versions (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version integer NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  analysis_version integer,                       -- confirmed analysis the bot was built from
  system_prompt text NOT NULL,
  knowledge_pack jsonb NOT NULL DEFAULT '{}',
  few_shot_examples jsonb NOT NULL DEFAULT '[]',
  source text NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'rules')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, version)
);
GRANT SELECT, INSERT ON public.bot_versions TO authenticated;
GRANT ALL ON public.bot_versions TO service_role;
ALTER TABLE public.bot_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own bots read" ON public.bot_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own bots insert" ON public.bot_versions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

COMMIT;
