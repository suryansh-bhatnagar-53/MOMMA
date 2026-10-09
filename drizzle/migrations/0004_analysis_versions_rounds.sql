-- Batch 2: analysis version history + interview rounds (delta interviewing).
-- Run once in Supabase → SQL Editor. All-or-nothing.
BEGIN;

-- 1. Interview rows follow their project on delete, like every other project table.
ALTER TABLE public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_project_id_fkey;
ALTER TABLE public.interview_sessions ADD CONSTRAINT interview_sessions_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.interview_questions DROP CONSTRAINT IF EXISTS interview_questions_project_id_fkey;
ALTER TABLE public.interview_questions ADD CONSTRAINT interview_questions_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
GRANT DELETE ON public.interview_sessions, public.interview_questions TO authenticated;
CREATE POLICY "Own session delete" ON public.interview_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own questions delete" ON public.interview_questions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Interview rounds: one session per (project, round); each round records the analysis version it covers.
ALTER TABLE public.interview_sessions ADD COLUMN round integer NOT NULL DEFAULT 1;
ALTER TABLE public.interview_sessions ADD COLUMN analysis_version integer;
ALTER TABLE public.interview_sessions DROP CONSTRAINT interview_sessions_pkey;
ALTER TABLE public.interview_sessions ADD PRIMARY KEY (project_id, round);
UPDATE public.interview_sessions s SET analysis_version = a.version
  FROM public.project_analyses a WHERE a.project_id = s.project_id;

ALTER TABLE public.interview_questions ADD COLUMN round integer NOT NULL DEFAULT 1;
DROP INDEX IF EXISTS public.interview_questions_project_idx;
CREATE INDEX interview_questions_project_idx ON public.interview_questions(project_id, round, ord);

-- 3. Immutable snapshot of every confirmed analysis (v1, v2, …). New rounds only ask about
--    gaps that are not already in the previous confirmed version.
CREATE TABLE public.project_analysis_versions (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version integer NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  goal text NOT NULL DEFAULT '',
  understood_facts jsonb NOT NULL DEFAULT '[]',
  assumptions jsonb NOT NULL DEFAULT '[]',
  missing_info jsonb NOT NULL DEFAULT '[]',
  contradictions jsonb NOT NULL DEFAULT '[]',
  todo_items jsonb NOT NULL DEFAULT '[]',
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, version)
);
GRANT SELECT, INSERT ON public.project_analysis_versions TO authenticated;
GRANT ALL ON public.project_analysis_versions TO service_role;
ALTER TABLE public.project_analysis_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own analysis versions read" ON public.project_analysis_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own analysis versions insert" ON public.project_analysis_versions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

-- Backfill: analyses already confirmed before this migration become their first snapshot.
INSERT INTO public.project_analysis_versions
  (project_id, version, user_id, goal, understood_facts, assumptions, missing_info, contradictions, todo_items, confirmed_at)
SELECT project_id, version, user_id, goal, understood_facts, assumptions, missing_info, contradictions, todo_items, confirmed_at
FROM public.project_analyses WHERE confirmed_at IS NOT NULL;

COMMIT;
