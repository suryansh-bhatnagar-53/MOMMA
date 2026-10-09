import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Lock, ChevronDown } from "lucide-react";
import { projectApi, statusClass, STATUSES, formatEvent, type Project } from "@/lib/projects";
import { useSignedInUser } from "./dashboard";

export const Route = createFileRoute("/project/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Project — M.O.M.M.A." },
      { name: "description", content: "Your MOMMA project workspace." },
      { property: "og:title", content: "Project — M.O.M.M.A." },
      { property: "og:description", content: "Your MOMMA project workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectDetail,
});

const SECTIONS = [
  { title: "Context", unlockAt: 0, note: "Upload documents and write a brief here. Coming in the next phase." },
  { title: "Analysis", unlockAt: 1, note: "MOMMA's reading of your project will appear here." },
  { title: "Interview", unlockAt: 2, note: "Adaptive questions to fill the gaps will appear here." },
  { title: "Bot", unlockAt: 4, note: "Your generated bot package will appear here." },
];

function ProjectDetail() {
  const { id } = Route.useParams();
  const user = useSignedInUser(`/project/${id}`);
  const qc = useQueryClient();
  const project = useQuery({ queryKey: ["project", id], enabled: !!user, queryFn: () => projectApi.get(id) });
  const timeline = useQuery({ queryKey: ["timeline", id], enabled: !!user, queryFn: () => projectApi.timeline(id) });

  const [draft, setDraft] = useState<Pick<Project, "name" | "description" | "status"> | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (project.data) setDraft({ name: project.data.name, description: project.data.description, status: project.data.status });
  }, [project.data]);

  const save = async (manual = false) => {
    if (!draft || !project.data || !draft.name.trim()) return;
    const p = project.data;
    const changed = draft.name !== p.name || draft.description !== p.description || draft.status !== p.status;
    if (!changed && !manual) return;
    setSaving("saving");
    try {
      if (changed) {
        await projectApi.update(id, { ...draft, name: draft.name.trim() });
        if (draft.status !== p.status) await projectApi.addEvent(id, "status_changed", { from: p.status, to: draft.status });
        else if (draft.name !== p.name) await projectApi.addEvent(id, "renamed", { to: draft.name.trim() });
      }
      if (manual) await projectApi.addEvent(id, "manual_save");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["project", id] }),
        qc.invalidateQueries({ queryKey: ["timeline", id] }),
        qc.invalidateQueries({ queryKey: ["projects"] }),
      ]);
      setSaving("saved");
    } catch {
      setSaving("error");
    }
  };

  if (!user || project.isLoading || (project.data && !draft))
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );

  if (project.error || !project.data || !draft)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-ink">
        <p>{project.error ? "Couldn't load this project." : "Project not found."}</p>
        <Link to="/dashboard" className="font-semibold text-brick hover:underline">← Back to dashboard</Link>
      </div>
    );

  const stage = STATUSES.indexOf(project.data.status);

  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link to="/dashboard" className="text-sm font-semibold text-brick hover:underline">← Leave Project</Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editingName ? (
              <input
                autoFocus
                maxLength={200}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                onBlur={() => { setEditingName(false); save(); }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full rounded-lg border border-line bg-paper px-2 py-1 font-display text-3xl font-semibold outline-none focus:ring-2 focus:ring-brick/40"
                aria-label="Project name"
              />
            ) : (
              <h1 className="flex items-center gap-2 font-display text-3xl font-semibold">
                <span className="truncate">{draft.name}</span>
                <button type="button" onClick={() => setEditingName(true)} aria-label="Edit project name" className="rounded p-1 text-ink/60 hover:bg-cream hover:text-ink">
                  <Pencil className="h-4 w-4" />
                </button>
              </h1>
            )}
            <div className="mt-3 flex items-center gap-3">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${statusClass[project.data.status]}`}>{project.data.status}</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as Project["status"] })}
                onBlur={() => save()}
                className="rounded-md border border-line bg-paper px-2 py-1 text-xs"
                aria-label="Change status"
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/60" aria-live="polite">
              {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : saving === "error" ? "Save failed" : ""}
            </span>
            <button type="button" onClick={() => save(true)} className="rounded-lg bg-brick px-4 py-2 font-semibold text-paper hover:opacity-90">Save</button>
          </div>
        </header>

        <label className="mt-6 block">
          <span className="text-sm font-semibold">Description</span>
          <textarea
            value={draft.description}
            maxLength={2000}
            rows={3}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            onBlur={() => save()}
            placeholder="What is this project about?"
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-brick/40"
          />
        </label>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            {SECTIONS.map((s) => {
              const unlocked = stage >= s.unlockAt;
              return (
                <details key={s.title} className={`group rounded-xl border border-line ${unlocked ? "bg-cream/40" : "bg-paper opacity-60"}`}>
                  <summary
                    className={`flex list-none items-center justify-between px-4 py-3 font-display font-semibold ${unlocked ? "cursor-pointer" : "pointer-events-none"}`}
                    aria-disabled={!unlocked}
                  >
                    {s.title}
                    {unlocked ? <ChevronDown className="h-4 w-4 transition group-open:rotate-180" /> : <Lock className="h-4 w-4" aria-label="Locked until previous step is done" />}
                  </summary>
                  <p className="px-4 pb-4 text-sm text-ink/70">{s.note}</p>
                </details>
              );
            })}
          </div>

          <aside>
            <h2 className="font-display text-lg font-semibold">Activity</h2>
            <ol className="mt-3 space-y-3 border-l border-line pl-4">
              {(timeline.data ?? []).map((ev) => (
                <li key={ev.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brick" />
                  <p className="font-semibold">{formatEvent(ev.type)}</p>
                  <p className="text-xs text-ink/50">{new Date(ev.created_at).toLocaleString()}</p>
                </li>
              ))}
              {timeline.data?.length === 0 && <li className="text-sm text-ink/60">No activity yet.</li>}
            </ol>
          </aside>
        </div>
      </main>
    </div>
  );
}
