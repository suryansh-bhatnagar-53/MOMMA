import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateAnalysis, type AnalysisFields } from "@/lib/analysis.functions";
import { projectApi, type ProjectStatus } from "@/lib/projects";
import { interviewApi } from "@/lib/interview";

const LISTS: { key: Exclude<keyof AnalysisFields, "goal">; label: string; hint: string }[] = [
  { key: "understood_facts", label: "What MOMMA understood", hint: "Clear facts from your context" },
  { key: "assumptions", label: "Assumptions", hint: "Things MOMMA guessed. Correct anything wrong." },
  { key: "missing_info", label: "Missing information", hint: "Gaps the interview will fill" },
  { key: "contradictions", label: "Contradictions", hint: "Statements that seem to conflict" },
  { key: "todo_items", label: "Interview to-do list", hint: "Questions MOMMA plans to ask you" },
];

type Draft = { goal: string } & Record<(typeof LISTS)[number]["key"], string>;

const toDraft = (a: AnalysisFields): Draft => ({
  goal: a.goal,
  ...(Object.fromEntries(LISTS.map(({ key }) => [key, (a[key] ?? []).join("\n")])) as Omit<Draft, "goal">),
});
const fromDraft = (d: Draft): AnalysisFields => ({
  goal: d.goal.trim(),
  ...(Object.fromEntries(
    LISTS.map(({ key }) => [key, d[key].split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)]),
  ) as Omit<AnalysisFields, "goal">),
});

export function AnalysisPanel({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const qc = useQueryClient();
  const generate = useServerFn(generateAnalysis);
  const analysis = useQuery({
    queryKey: ["analysis", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_analyses").select("*").eq("project_id", projectId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  // Shares the InterviewPanel cache entry. Once a session exists, its questions were built from
  // this analysis, so regenerating it would leave them out of sync.
  const interview = useQuery({ queryKey: ["interview", projectId], queryFn: () => interviewApi.load(projectId) });
  const interviewStarted = !!interview.data?.session;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (analysis.data) setDraft(toDraft(analysis.data as unknown as AnalysisFields));
  }, [analysis.data]);

  const refresh = () =>
    Promise.all(
      [["analysis", projectId], ["timeline", projectId], ["project", projectId], ["projects"]].map((k) =>
        qc.invalidateQueries({ queryKey: k }),
      ),
    );

  const run = async () => {
    if (interviewStarted) return;
    if (analysis.data && !confirm("Re-analyze from your context? Your edits here will be replaced.")) return;
    setBusy("MOMMA is reading your project…");
    setMsg(null);
    try {
      const r = await generate({ data: { projectId } });
      if (status !== "Analyzing") await projectApi.update(projectId, { status: "Analyzing" });
      if (r.source === "rules") setMsg("The AI couldn't be reached, so this is a basic first pass. Try Re-analyze later.");
      await refresh();
    } catch {
      setMsg("Analysis failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const save = async (): Promise<boolean> => {
    if (!draft) return false;
    const { error } = await supabase.from("project_analyses").update(fromDraft(draft)).eq("project_id", projectId);
    if (error) {
      setMsg("Couldn't save your edits.");
      return false;
    }
    return true;
  };

  const confirmIt = async () => {
    setBusy("Confirming…");
    setMsg(null);
    try {
      if (!(await save())) return;
      const { error } = await supabase.from("project_analyses").update({ confirmed_at: new Date().toISOString() }).eq("project_id", projectId);
      if (error) throw error;
      await projectApi.update(projectId, { status: "Interviewing" });
      await projectApi.addEvent(projectId, "analysis_confirmed", { version: analysis.data?.version });
      await refresh();
    } catch {
      setMsg("Couldn't confirm the analysis. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  if (analysis.isLoading) return <div className="p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  if (!analysis.data || !draft)
    return (
      <div className="px-4 pb-5">
        {busy ? (
          <p className="flex items-center gap-2 text-sm text-ink/70"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>
        ) : (
          <>
            <p className="text-sm text-ink/70">No analysis yet. MOMMA will read your text and files and report what it understood.</p>
            <button type="button" onClick={run} className="mt-3 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper">Run analysis</button>
          </>
        )}
        {msg && <p className="mt-2 text-sm text-brick">{msg}</p>}
      </div>
    );

  const confirmed = !!analysis.data.confirmed_at;

  return (
    <div className="space-y-4 px-4 pb-5">
      <p className="text-xs text-ink/50">
        Version {analysis.data.version}{confirmed ? " · Confirmed" : " · Review and edit, then confirm"}
      </p>
      <label className="block">
        <span className="text-sm font-semibold">Project goal</span>
        <textarea
          value={draft.goal}
          onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
          onBlur={save}
          rows={2}
          className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brick/40"
        />
      </label>
      {LISTS.map(({ key, label, hint }) => (
        <label key={key} className="block">
          <span className="text-sm font-semibold">{label}</span>
          <span className="ml-2 text-xs text-ink/50">{hint} · one per line</span>
          <textarea
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            onBlur={save}
            rows={Math.min(8, Math.max(2, draft[key].split("\n").length + 1))}
            placeholder="None"
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brick/40"
          />
        </label>
      ))}
      {msg && <p className="text-sm text-brick">{msg}</p>}
      {busy && <p className="flex items-center gap-2 text-sm text-ink/70"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>}
      {interviewStarted && (
        <p className="text-xs text-ink/60">The interview has started, so re-analysis is locked. You can still edit the fields above.</p>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4">
        <button type="button" onClick={run} disabled={!!busy || interviewStarted} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-cream disabled:opacity-50">
          <RefreshCw className="h-4 w-4" /> Re-analyze
        </button>
        {!confirmed && (
          <button type="button" onClick={confirmIt} disabled={!!busy || !draft.goal.trim()} className="inline-flex items-center gap-2 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" /> Confirm Understanding
          </button>
        )}
      </div>
    </div>
  );
}
