import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth", search: { next: "/dashboard", tab: undefined }, replace: true });
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle();
      if (active) setState({ email: data.user.email ?? "", name: profile?.display_name ?? "" });
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", search: { next: undefined, tab: undefined }, replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
  };

  if (!state)
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 font-body text-ink">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold">Welcome{state.name ? `, ${state.name}` : ""}.</h1>
        <p className="mt-3 text-ink/70">
          You're signed in as <strong className="text-ink">{state.email}</strong>. Your projects and bots will live here.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6">
          <Link to="/" className="font-semibold text-brick hover:underline">← Back to home</Link>
          <button type="button" onClick={signOut} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-cream">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
