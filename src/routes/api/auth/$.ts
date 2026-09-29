import { createFileRoute } from "@tanstack/react-router";

// MOCK auth endpoints for previewing the UI flow — no real accounts are stored.
// TODO: replace with real auth (Lovable Cloud) before launch.
// Demo OTP is always 123456.
const DEMO_OTP = "123456";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const emailOk = (e: unknown) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 255;
const pwOk = (p: unknown) => typeof p === "string" && p.length >= 8 && p.length < 128 && /[a-z]/i.test(p) && /\d/.test(p);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const action = params._splat ?? "";
        let body: { [k: string]: unknown; a?: unknown } = {};
        try {
          body = await request.json();
        } catch {
          return json({ message: "Invalid request." }, 400);
        }
        await new Promise((r) => setTimeout(r, 500));

        switch (action) {
          case "verify-captcha": {
            const { a, b, answer } = body;
            const ok =
              typeof a === "number" && typeof b === "number" && a >= 0 && a <= 9 && b >= 0 && b <= 9 &&
              Number(answer) === a + b;
            return ok ? json({ success: true }) : json({ success: false, message: "Security check failed." }, 400);
          }
          case "login":
            if (!emailOk(body["email"]) || typeof body["password"] !== "string" || body["password"].length < 8)
              return json({ message: "Invalid credentials." }, 401);
            return json({ success: true, token: "mock-token" });
          case "register":
            if (!emailOk(body["email"]) || !pwOk(body["password"]))
              return json({ message: "Please check your email and password." }, 400);
            return json({ success: true, message: "OTP sent." });
          case "forgot-password":
            if (!emailOk(body["email"])) return json({ message: "Enter a valid email." }, 400);
            return json({ success: true });
          case "resend-otp":
            return json({ success: true });
          case "verify-otp":
            return body["otp"] === DEMO_OTP
              ? json({ success: true, token: "mock-token" })
              : json({ message: "That code is invalid or expired." }, 400);
          case "reset-password":
            if (!pwOk(body["password"])) return json({ message: "Password too weak." }, 400);
            return json({ success: true });
          default:
            return json({ message: "Not found." }, 404);
        }
      },
    },
  },
});
