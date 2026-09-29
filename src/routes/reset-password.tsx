import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — M.O.M.M.A." },
      { name: "description", content: "Choose a new password for your MOMMA account." },
      { property: "og:title", content: "Set a new password — M.O.M.M.A." },
      { property: "og:description", content: "Choose a new password for your MOMMA account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [cf, setCf] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8 || !/[a-z]/i.test(pw) || !/\d/.test(pw)) return setMsg("Use at least 8 characters with a letter and a number.");
    if (pw !== cf) return setMsg("Passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg("This reset link is invalid or expired. Request a new one from the log-in page.");
    navigate({ to: "/dashboard" });
  };

  const input = "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-brick focus:ring-2 focus:ring-brick/25";
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 font-body text-ink">
      <form onSubmit={submit} className="w-full max-w-[420px] space-y-4 rounded-2xl bg-cream p-8 shadow-lg">
        <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
        {msg && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg}</p>}
        <input type="password" aria-label="New password" placeholder="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} />
        <input type="password" aria-label="Confirm new password" placeholder="Confirm new password" autoComplete="new-password" value={cf} onChange={(e) => setCf(e.target.value)} className={input} />
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-brick py-2.5 text-sm font-semibold text-cream hover:bg-brick/90 disabled:opacity-70">
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
