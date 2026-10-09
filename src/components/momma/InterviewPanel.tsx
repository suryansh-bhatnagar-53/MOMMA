import { useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pause, Play, CheckCircle2, SendHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { interviewApi } from "@/lib/interview";
import type { ProjectStatus } from "@/lib/projects";

export function InterviewPanel({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const qc = useQueryClient();
  const state = useQuery({ queryKey: ["interview", projectId], queryFn: () => interviewApi.load(projectId) });
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  // `busy` only disables buttons after a re-render, so a fast double click could run an action twice.
  const running = useRef(false);

  const refresh = () =>
    Promise.all(
      [["interview", projectId], ["timeline", projectId], ["project", projectId], ["projects"]].map((k) =>
        qc.invalidateQueries({ queryKey: k }),
      ),
    );

  const act = async (fn: () => Promise<unknown>, fail: string) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      await refresh();
    } catch {
      setMsg(fail);
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  if (state.isLoading) return <div className="p-4"><Loader2 className="h-5 w-5 animate-spin" aria-label="Loading interview" /></div>;
  if (state.error || !state.data) return <p className="px-4 pb-4 text-sm text-brick">Couldn't load the interview.</p>;

  const { session, questions } = state.data;

  const start = () =>
    act(async () => {
      const { data, error } = await supabase.from("project_analyses").select("*").eq("project_id", projectId).maybeSingle();
      if (error) throw error;
      if (!data?.confirmed_at) throw new Error("not confirmed");
      await interviewApi.start(projectId, data as never);
    }, "Couldn't start. Make sure the analysis is confirmed first.");

  // A session without questions means an earlier start only half finished.
  if (session && questions.length === 0)
    return (
      <div className="px-4 pb-5">
        <p className="text-sm text-ink/70">The interview was started but its questions weren't saved.</p>
        <button type="button" onClick={start} disabled={busy} className="mt-3 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
          {busy ? "Preparing questions…" : "Prepare questions"}
        </button>
        {msg && <p className="mt-2 text-sm text-brick">{msg}</p>}
      </div>
    );

  if (!session) {
    return (
      <div className="px-4 pb-5">
        <p className="text-sm text-ink/70">MOMMA will ask about the gaps it found in your analysis, one question at a time. You can pause and come back whenever you like.</p>
        <button type="button" onClick={start} disabled={busy || status !== "Interviewing"} className="mt-3 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
          {busy ? "Preparing questions…" : "Start interview"}
        </button>
        {msg && <p className="mt-2 text-sm text-brick">{msg}</p>}
      </div>
    );
  }

  const answered = questions.filter((q) => q.answered_at);
  const currentIdx = questions.findIndex((q) => !q.answered_at);
  const current = currentIdx >= 0 ? questions[currentIdx] : null;
  const next = currentIdx >= 0 ? questions[currentIdx + 1] : undefined;
  const ended = !!session.ended_at;
  const paused = session.is_paused && !ended;
  const label = ended ? "Completed" : paused ? "Paused" : current ? "In progress" : "All questions answered";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!current || !answer.trim() || paused) return;
    void act(async () => {
      const vague = await interviewApi.answer(current, answer, next ? next.ord : null);
      setAnswer("");
      if (vague) setTimeout(() => setMsg("MOMMA added a quick follow-up to get a bit more detail."), 0);
    }, "Couldn't save your answer. Please try again.");
  };

  return (
    <div className="space-y-4 px-4 pb-5">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className={`rounded-full border px-3 py-0.5 font-semibold ${ended ? "border-moss/40 bg-moss/15 text-moss" : paused ? "border-mustard bg-mustard/20 text-ink" : "border-brick/40 bg-brick/10 text-brick"}`}>{label}</span>
        <span className="text-ink/60">{answered.length} of {questions.length} answered</span>
        <div className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full bg-brick transition-all" style={{ width: `${(answered.length / Math.max(1, questions.length)) * 100}%` }} />
        </div>
      </div>

      {current && !ended && (
        <form onSubmit={submit} className="rounded-xl border border-line bg-paper p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Question {answered.length + 1}{current.kind === "followup" ? " · Follow-up" : ""}
          </p>
          <p className="mt-1 font-display font-semibold">{current.text}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={paused || busy}
            rows={4}
            maxLength={4000}
            aria-label="Your answer"
            placeholder={paused ? "Interview paused. Resume to keep answering." : "Your answer…"}
            className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brick/40 disabled:opacity-60"
          />
          <div className="mt-3 flex flex-wrap justify-end gap-3">
            {paused ? (
              <button type="button" onClick={() => act(() => interviewApi.setPaused(projectId, false), "Couldn't resume.")} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-cream disabled:opacity-50">
                <Play className="h-4 w-4" /> Resume
              </button>
            ) : (
              <button type="button" onClick={() => act(() => interviewApi.setPaused(projectId, true), "Couldn't pause.")} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-cream disabled:opacity-50">
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button type="submit" disabled={busy || paused || !answer.trim()} className="inline-flex items-center gap-2 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />} Send Answer
            </button>
          </div>
        </form>
      )}

      {msg && <p className="text-sm text-brick" aria-live="polite">{msg}</p>}

      {!ended && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-moss/40 bg-moss/10 p-4">
          <p className="text-sm">
            {current ? "Covered enough? You can finish early and move on." : "All gaps are covered. Confirm to move on to building your project knowledge."}
          </p>
          <button
            type="button"
            onClick={() => (current && !confirm("Finish the interview with unanswered questions?") ? undefined : act(() => interviewApi.confirm(projectId, answered.length), "Couldn't confirm the interview."))}
            disabled={busy || answered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" /> Confirm Interview
          </button>
        </div>
      )}

      {answered.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-semibold">Interview summary</h3>
          <ol className="mt-2 space-y-3">
            {answered.map((q, i) => (
              <li key={q.id} className="rounded-lg border border-line bg-paper/60 p-3 text-sm">
                <p className="text-ink/70"><span className="font-semibold text-ink">Q{i + 1}{q.kind === "followup" ? " (follow-up)" : ""}:</span> {q.text}</p>
                <p className="mt-1"><span className="font-semibold">A:</span> {q.answer_text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
