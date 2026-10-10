import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, RefreshCw, SendHorizontal, Sparkles } from "lucide-react";
import { strToU8, zipSync } from "fflate";
import { supabase } from "@/integrations/supabase/client";
import { generateBot, chatWithBot } from "@/lib/bot.functions";
import { generatedBy, packageFiles, readExamples, readKnowledge, type BotVersion } from "@/lib/bot";
import type { ProjectStatus } from "@/lib/projects";

type Turn = { role: "user" | "assistant"; content: string };

export function BotPanel({ projectId, projectName, status }: { projectId: string; projectName: string; status: ProjectStatus }) {
  const qc = useQueryClient();
  const generate = useServerFn(generateBot);
  const chat = useServerFn(chatWithBot);
  const bots = useQuery({
    queryKey: ["bots", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("bot_versions").select("*").eq("project_id", projectId).order("version", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const running = useRef(false);

  const bot: BotVersion | undefined = bots.data?.find((b) => b.version === selected) ?? bots.data?.[0];
  useEffect(() => setTurns([]), [bot?.version]); // each version gets a fresh test chat

  const canGenerate = status === "Ready" || status === "Generated";

  const run = async () => {
    if (running.current) return;
    running.current = true;
    setBusy("MOMMA is building your bot…");
    setMsg(null);
    try {
      const r = await generate({ data: { projectId } });
      setSelected(r.version);
      if (r.source === "rules") setMsg("The AI couldn't be reached, so this is a basic version without examples. Try Regenerate later.");
      else if (r.dropped > 0)
        setMsg(`${r.dropped} example conversation${r.dropped > 1 ? "s were" : " was"} removed because it stated things not in the knowledge pack.`);
      await Promise.all(
        [["bots", projectId], ["timeline", projectId], ["project", projectId], ["projects"]].map((k) => qc.invalidateQueries({ queryKey: k })),
      );
    } catch {
      setMsg("Couldn't generate the bot. Make sure the interview is confirmed, then try again.");
    } finally {
      running.current = false;
      setBusy(null);
    }
  };

  const download = () => {
    if (!bot) return;
    const folder = `${projectName.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "momma"}-bot-v${bot.version}`;
    const files = Object.fromEntries(Object.entries(packageFiles(projectName, bot)).map(([n, c]) => [`${folder}/${n}`, strToU8(c)]));
    const url = URL.createObjectURL(new Blob([zipSync(files) as Uint8Array<ArrayBuffer>], { type: "application/zip" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${folder}.zip` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!bot || !text || running.current) return;
    running.current = true;
    const next: Turn[] = [...turns, { role: "user" as const, content: text }].slice(-20);
    setTurns(next);
    setInput("");
    setBusy("chat");
    try {
      const r = await chat({ data: { projectId, version: bot.version, messages: next } });
      const reply = r.limited
        ? "You've reached the test-chat limit (30 messages per 10 minutes). Please wait a bit."
        : r.reply ?? "The AI couldn't be reached. Please try again.";
      setTurns([...next, { role: "assistant", content: reply }]);
    } catch {
      setTurns([...next, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      running.current = false;
      setBusy(null);
    }
  };

  if (bots.isLoading) return <div className="p-4"><Loader2 className="h-5 w-5 animate-spin" aria-label="Loading bot" /></div>;
  if (bots.error) return <p className="px-4 pb-4 text-sm text-brick">Couldn't load your bot.</p>;

  if (!bot)
    return (
      <div className="px-4 pb-5">
        <p className="text-sm text-ink/70">
          MOMMA will turn your confirmed analysis and every interview answer into a bot: a system prompt, a knowledge pack and example
          conversations. You can test it here and download it.
        </p>
        {busy ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink/70"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>
        ) : (
          <button type="button" onClick={run} disabled={!canGenerate} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> Generate bot
          </button>
        )}
        {msg && <p className="mt-2 text-sm text-brick">{msg}</p>}
      </div>
    );

  const kp = readKnowledge(bot.knowledge_pack);
  const examples = readExamples(bot.few_shot_examples);
  const by = generatedBy(bot);

  return (
    <div className="space-y-5 px-4 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink/60">
          <select
            value={bot.version}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="rounded-md border border-line bg-paper px-2 py-1 text-xs"
            aria-label="Bot version"
          >
            {bots.data!.map((b) => <option key={b.version} value={b.version}>Version {b.version}</option>)}
          </select>
          <span>
            {bot.source === "ai" ? `AI-generated${by?.bot ? ` by ${by.bot}` : ""}` : "Basic (no AI)"} · from analysis v{bot.analysis_version ?? "?"} · {new Date(bot.created_at).toLocaleString()}
            {by?.examples_checked_by && by.examples_checked_by !== by.bot && ` · examples checked by ${by.examples_checked_by}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={run} disabled={!!busy || !canGenerate} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-cream disabled:opacity-50">
            <RefreshCw className="h-4 w-4" /> Regenerate
          </button>
          <button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-lg bg-brick px-3 py-1.5 text-sm font-semibold text-paper">
            <Download className="h-4 w-4" /> Download package
          </button>
        </div>
      </div>
      {busy && busy !== "chat" && <p className="flex items-center gap-2 text-sm text-ink/70"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>}
      {msg && <p className="text-sm text-brick">{msg}</p>}

      <details className="rounded-lg border border-line bg-paper">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">System prompt</summary>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap px-3 pb-3 text-xs text-ink/80">{bot.system_prompt}</pre>
      </details>

      <details className="rounded-lg border border-line bg-paper">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">Knowledge pack · {kp.facts.length} facts</summary>
        <div className="space-y-3 px-3 pb-3 text-sm">
          {kp.audience && <p><span className="font-semibold">Audience:</span> {kp.audience}</p>}
          {kp.responsibilities.length > 0 && (
            <div><p className="font-semibold">The bot's job</p><ul className="list-disc pl-5">{kp.responsibilities.map((x) => <li key={x}>{x}</li>)}</ul></div>
          )}
          <ul className="space-y-1">
            {kp.facts.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 shrink-0 text-right text-xs text-ink/40">{i + 1}.</span>
                <span className={`mt-0.5 shrink-0 rounded-full border px-2 text-[10px] font-semibold ${f.source === "interview" ? "border-brick/40 text-brick" : "border-line text-ink/60"}`}>
                  {f.source}
                </span>
                {f.status && (
                  <span className={`mt-0.5 shrink-0 rounded-full border px-2 text-[10px] font-semibold ${f.status === "implemented" ? "border-moss/40 text-moss" : "border-mustard text-ink/70"}`}>
                    {f.status}
                  </span>
                )}
                <span>{f.statement}</span>
              </li>
            ))}
          </ul>
          {kp.out_of_scope.length > 0 && (
            <div><p className="font-semibold">Out of scope</p><ul className="list-disc pl-5">{kp.out_of_scope.map((x) => <li key={x}>{x}</li>)}</ul></div>
          )}
          {kp.open_questions.length > 0 && (
            <div><p className="font-semibold">Still unknown (the bot won't guess)</p><ul className="list-disc pl-5">{kp.open_questions.map((x) => <li key={x}>{x}</li>)}</ul></div>
          )}
          {kp.escalation && <p><span className="font-semibold">When it can't help:</span> {kp.escalation}</p>}
        </div>
      </details>

      <details className="rounded-lg border border-line bg-paper">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">Example conversations · {examples.length} (AI-written, checked against the facts)</summary>
        <div className="space-y-3 px-3 pb-3 text-sm">
          {examples.length === 0 && <p className="text-ink/60">None in this version.</p>}
          {examples.map((e, i) => (
            <div key={i} className="rounded-md bg-cream/50 p-2">
              <p><span className="font-semibold">User:</span> {e.user}</p>
              <p className="mt-1"><span className="font-semibold">Bot:</span> {e.assistant}</p>
              <p className="mt-1 text-xs text-ink/50">{e.facts?.length ? `Uses facts ${e.facts.join(", ")}` : "Uses no facts (declines or says it doesn't know)"}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="rounded-xl border border-line bg-paper p-4">
        <h3 className="font-display text-sm font-semibold">Test chat · version {bot.version}</h3>
        <p className="text-xs text-ink/50">Same instructions as the downloaded bot. Not saved; limited to 30 messages per 10 minutes.</p>
        <div className="mt-3 max-h-96 space-y-2 overflow-auto" aria-live="polite">
          {turns.map((t, i) => (
            <p key={i} className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${t.role === "user" ? "ml-8 bg-brick/10" : "mr-8 bg-cream/60"}`}>
              {t.content}
            </p>
          ))}
          {busy === "chat" && <Loader2 className="h-4 w-4 animate-spin text-ink/50" aria-label="Bot is replying" />}
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            placeholder="Ask your bot something a real user would…"
            aria-label="Message to your bot"
            className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brick/40"
          />
          <button type="submit" disabled={!!busy || !input.trim()} className="inline-flex items-center gap-2 rounded-lg bg-brick px-3 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            <SendHorizontal className="h-4 w-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
