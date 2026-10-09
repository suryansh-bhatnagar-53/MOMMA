CREATE TABLE public.project_contexts (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.project_contexts TO authenticated;
GRANT ALL ON public.project_contexts TO service_role;
ALTER TABLE public.project_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own context read" ON public.project_contexts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own context insert" ON public.project_contexts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Own context update" ON public.project_contexts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER project_contexts_touch BEFORE UPDATE ON public.project_contexts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.project_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  filename text NOT NULL CHECK (char_length(filename) BETWEEN 1 AND 255),
  stored_path text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  extracted_text text,
  extracted_text_preview text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_resources_project_idx ON public.project_resources(project_id);
GRANT SELECT, INSERT, DELETE ON public.project_resources TO authenticated;
GRANT ALL ON public.project_resources TO service_role;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own resources read" ON public.project_resources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own resources insert" ON public.project_resources FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Own resources delete" ON public.project_resources FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Own project files read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own project files insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own project files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);