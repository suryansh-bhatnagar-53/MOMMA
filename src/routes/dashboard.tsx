import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — M.O.M.M.A." },
      { name: "description", content: "Your MOMMA projects and bots." },
      { property: "og:title", content: "Dashboard — M.O.M.M.A." },
      { property: "og:description", content: "Your MOMMA projects and bots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 font-body text-ink">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold">You're in.</h1>
        <p className="mt-3 text-ink/70">
          This is a placeholder dashboard — the sign-in you just did was a preview with no real account.
        </p>
        <Link to="/" className="mt-6 inline-block font-semibold text-brick hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
