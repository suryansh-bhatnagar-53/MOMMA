import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { projectApi, statusClass } from "@/lib/projects";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — M.O.M.M.A." },
      { name: "description", content: "Your MOMMA projects and bots." },
      { property: "og:title", content: "Dashboard — M.O.M.M.A." },
      { property: "og:description", content: "Your MOMMA projects and bots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

export function useSignedInUser(next: string) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth", search: { next, tab: undefined }, replace: true });
        return;
      }
      if (active) setUser({ id: data.user.id, email: data.user.email ?? "" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", search: { next: undefined, tab: undefined }, replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, next]);
  return user;
}

function Dashboard() {
  const user = useSignedInUser("/dashboard");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("profiles").select("display_name").eq("id", user!.id).maybeSingle()).data,
  });
  const projects = useQuery({ queryKey: ["projects", user?.id], enabled: !!user, queryFn: projectApi.list });

  const create = useMutation({
    mutationFn: () => projectApi.create({ name: name.trim(), description: desc.trim() }),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      setDesc("");
      navigate({ to: "/project/$id", params: { id: p.id } });
    },
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
  };

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );

  const displayName = profile.data?.display_name || user.email;

  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-lg font-semibold">🛡️ M.O.M.M.A.</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-ink/70 sm:inline">{user.email}</span>
            <button type="button" onClick={signOut} className="rounded-lg border border-line px-3 py-1.5 font-semibold hover:bg-cream">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Welcome, {displayName}</h1>
            <p className="mt-1 text-ink/70">Your projects. Pick one up where you left off, or start a new one.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brick px-5 py-2.5 font-semibold text-paper hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create Project
          </button>
        </div>

        {projects.isLoading ? (
          <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : projects.error ? (
          <p className="mt-10 text-brick">Couldn't load your projects. Please refresh.</p>
        ) : projects.data!.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-line bg-cream/50 p-10 text-center">
            <p className="text-ink/70">You have no projects yet. Click "Create Project" to start.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data!.map((p) => (
              <article key={p.id} className="flex flex-col rounded-xl border border-line bg-paper p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass[p.status]}`}>{p.status}</span>
                </div>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink/70">{p.description || "—"}</p>
                <p className="mt-4 text-xs text-ink/50">Updated {new Date(p.updated_at).toLocaleString()}</p>
                <Link
                  to="/project/$id"
                  params={{ id: p.id }}
                  className="mt-3 inline-block rounded-lg border border-line px-3 py-1.5 text-center text-sm font-semibold hover:bg-cream"
                >
                  Open Project
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-paper text-ink">
          <DialogHeader>
            <DialogTitle className="font-display">New project</DialogTitle>
            <DialogDescription>Give it a name. You can add details later.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) create.mutate();
            }}
            className="space-y-3"
          >
            <input
              autoFocus
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-brick/40"
            />
            <textarea
              value={desc}
              maxLength={2000}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description (optional)"
              rows={3}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-brick/40"
            />
            {create.error && <p className="text-sm text-brick">Could not create project. Try again.</p>}
            <DialogFooter>
              <button type="submit" disabled={create.isPending || !name.trim()} className="rounded-lg bg-brick px-4 py-2 font-semibold text-paper disabled:opacity-50">
                {create.isPending ? "Creating…" : "Create"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
