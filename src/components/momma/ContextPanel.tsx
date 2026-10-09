import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Trash2, Upload, Sparkles } from "lucide-react";
import { contextApi, ACCEPT, ALLOWED_TYPES, formatBytes } from "@/lib/context";
import { projectApi, type ProjectStatus } from "@/lib/projects";
import { useServerFn } from "@tanstack/react-start";
import { generateAnalysis } from "@/lib/analysis.functions";

export function ContextPanel({ projectId, userId, status }: { projectId: string; userId: string; status: ProjectStatus }) {
  const qc = useQueryClient();
  const generate = useServerFn(generateAnalysis);
  const ctx = useQuery({ queryKey: ["context", projectId], queryFn: () => contextApi.get(projectId) });
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ctx.data) {
      setText(ctx.data.text);
      setSavedText(ctx.data.text);
    }
  }, [ctx.data]);

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["context", projectId] }),
      qc.invalidateQueries({ queryKey: ["timeline", projectId] }),
      qc.invalidateQueries({ queryKey: ["project", projectId] }),
      qc.invalidateQueries({ queryKey: ["projects"] }),
    ]);

  const saveText = async () => {
    if (text === savedText) return;
    setBusy("Saving…");
    try {
      await contextApi.saveText(projectId, text);
      if (!savedText) await projectApi.addEvent(projectId, "context_added", { kind: "text" });
      setSavedText(text);
      await refresh();
    } catch {
      setErrors(["Couldn't save your text. Try again."]);
    } finally {
      setBusy(null);
    }
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const errs: string[] = [];
    const ok = Array.from(list).filter((f) => {
      const e = contextApi.validate(f);
      if (e) errs.push(e);
      return !e;
    });
    for (const [i, f] of ok.entries()) {
      setBusy(`Uploading ${i + 1} of ${ok.length}: ${f.name}`);
      try {
        await contextApi.upload(projectId, userId, f);
        await projectApi.addEvent(projectId, "file_uploaded", { filename: f.name });
      } catch {
        errs.push(`${f.name}: upload failed`);
      }
    }
    setErrors(errs);
    setBusy(null);
    if (input.current) input.current.value = "";
    await refresh();
  };

  const remove = async (r: Parameters<typeof contextApi.remove>[0]) => {
    setBusy(`Removing ${r.filename}…`);
    try {
      await contextApi.remove(r);
      await projectApi.addEvent(projectId, "file_removed", { filename: r.filename });
      await refresh();
    } catch {
      setErrors([`Couldn't remove ${r.filename}.`]);
    } finally {
      setBusy(null);
    }
  };

  const analyze = async () => {
    await saveText();
    setBusy("Starting analysis…");
    try {
      await projectApi.update(projectId, { status: "Analyzing" });
      await projectApi.addEvent(projectId, "analysis_started", { files: ctx.data?.files.length ?? 0 });
      await refresh();
      setBusy("MOMMA is reading your project…");
      await generate({ data: { projectId } });
      await qc.invalidateQueries({ queryKey: ["analysis", projectId] });
      await refresh();
    } catch {
      setErrors(["Couldn't start analysis."]);
    } finally {
      setBusy(null);
    }
  };

  if (ctx.isLoading) return <div className="p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const files = ctx.data?.files ?? [];
  const hasContext = text.trim().length > 0 || files.length > 0;

  return (
    <div className="space-y-5 px-4 pb-5">
      <label className="block">
        <span className="text-sm font-semibold">Tell MOMMA about your project</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={saveText}
          rows={6}
          maxLength={20000}
          placeholder="What are you building, who is it for, what should the bot help with?"
          className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brick/40"
        />
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${drag ? "border-brick bg-brick/5" : "border-line bg-paper"}`}
      >
        <Upload className="mx-auto h-6 w-6 text-ink/60" />
        <p className="mt-2 text-sm">Drop files here or{" "}
          <button type="button" onClick={() => input.current?.click()} className="font-semibold text-brick hover:underline">browse</button>
        </p>
        <p className="mt-1 text-xs text-ink/50">PDF, Word, TXT, PNG or JPG · up to 10 MB each</p>
        <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {busy && <p className="flex items-center gap-2 text-sm text-ink/70" aria-live="polite"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>}
      {errors.length > 0 && (
        <ul className="rounded-lg border border-brick/40 bg-brick/5 p-3 text-sm text-brick">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="rounded-lg border border-line bg-paper p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-ink/60" />
                  <span className="truncate text-sm font-semibold">{f.filename}</span>
                  <span className="shrink-0 text-xs text-ink/50">{ALLOWED_TYPES[f.mime_type] ?? ""} · {formatBytes(f.size_bytes)}</span>
                </div>
                <button type="button" onClick={() => remove(f)} disabled={!!busy} aria-label={`Remove ${f.filename}`} className="rounded p-1 text-ink/50 hover:bg-cream hover:text-brick">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 line-clamp-3 text-xs text-ink/60">
                {f.extracted_text_preview || "No text could be read from this file. It's still saved with your project."}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-ink/60">
          {status === "Draft" ? "When you're ready, MOMMA will read everything above." : "Added something new? Use Re-analyse in the Analysis section; MOMMA will only interview you about what changed."}
        </p>
        {status === "Draft" && (
          <button type="button" onClick={analyze} disabled={!hasContext || !!busy} className="inline-flex items-center gap-2 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> Analyze
          </button>
        )}
      </div>
    </div>
  );
}
