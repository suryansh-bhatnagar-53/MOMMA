CREATE TYPE public.project_status AS ENUM ('Draft','Analyzing','Interviewing','Ready','Generated');

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description text NOT NULL DEFAULT '',
  status public.project_status NOT NULL DEFAULT 'Draft',
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_user_idx ON public.projects(user_id);
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own projects read" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own projects insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own projects update" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.project_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  type text NOT NULL CHECK (char_length(type) BETWEEN 1 AND 50),
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_timeline_project_idx ON public.project_timeline(project_id, created_at);
GRANT SELECT, INSERT ON public.project_timeline TO authenticated;
GRANT ALL ON public.project_timeline TO service_role;
ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own timeline read" ON public.project_timeline FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own timeline insert" ON public.project_timeline FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.project_created_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO public.project_timeline(project_id, user_id, type, details) VALUES (NEW.id, NEW.user_id, 'created', jsonb_build_object('name', NEW.name)); RETURN NEW; END; $$;
CREATE TRIGGER projects_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.project_created_event();