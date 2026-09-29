import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import bg from "@/assets/auth-bg.jpg";
import { supabase } from "@/integrations/supabase/client";

const title = "Log in or sign up — M.O.M.M.A.";
const description = "Log in to MOMMA or create an account to start building your customized AI bot.";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s["next"] === "string" && s["next"].startsWith("/") ? s["next"] : undefined,
    tab: s["tab"] === "signup" ? ("signup" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const friendly = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox for the code.";
  if (m.includes("already registered")) return "That email already has an account. Try logging in.";
  if (m.includes("expired") || m.includes("invalid") && m.includes("token")) return "That code is invalid or expired.";
  if (m.includes("rate limit") || m.includes("security purposes")) return "Too many attempts. Please wait a minute and try again.";
  return msg;
};
async function check<T extends { error: { message: string } | null }>(p: Promise<T>): Promise<T> {
  const r = await p;
  if (r.error) throw new Error(friendly(r.error.message));
  return r;
}

const emailSchema = z.string().trim().email("Enter a valid email address.").max(255);
const pwSchema = z
  .string()
  .min(8, "At least 8 characters.")
  .max(128)
  .regex(/[a-z]/i, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

type Tab = "login" | "signup";
type View = "form" | "otp" | "forgot-email" | "forgot-otp" | "forgot-new";

function AuthPage() {
  const navigate = useNavigate();
  const { next, tab: initialTab } = Route.useSearch();
  const [tab, setTab] = useState<Tab>(initialTab ?? "login");
  const [view, setView] = useState<View>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<Partial<Record<"email"|"password"|"confirm"|"captcha"|"otp", string>>>({});
  const [banner, setBanner] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Math CAPTCHA — shown after a valid email loses focus.
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaOk, setCaptchaOk] = useState(false);
  const newCaptcha = () => {
    setCaptcha({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) });
    setCaptchaAnswer("");
    setCaptchaOk(false);
  };
  const onEmailBlur = () => {
    if (!captcha && emailSchema.safeParse(email).success) newCaptcha();
  };
  // TODO: swap for hCaptcha/reCAPTCHA (lazy-load its script here via dynamic injection) when real auth lands.

  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setView("form");
    setErrors({});
    setBanner(null);
  };

  const done = () => navigate({ to: next ?? "/dashboard" });

  async function run(fn: () => Promise<void>) {
    setLoading(true);
    setBanner(null);
    try {
      await fn();
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  // If already signed in (or a confirmation link was clicked), go straight in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && view === "form") done();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && view === "otp") done();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Client-side math check. TODO: swap for hCaptcha/reCAPTCHA with server-side token verification.
  async function verifyCaptcha() {
    if (!captcha) {
      newCaptcha();
      throw new Error("Please complete the security check.");
    }
    if (Number(captchaAnswer) !== captcha.a + captcha.b) {
      setErrors((e) => ({ ...e, captcha: "That sum isn't right — try again." }));
      throw new Error("Security check failed.");
    }
    setCaptchaOk(true);
  }

  const onSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<"email"|"password"|"confirm", string>> = {};
    const em = emailSchema.safeParse(email);
    if (!em.success) errs.email = em.error.issues[0]?.message ?? "Invalid email.";
    if (tab === "login") {
      if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    } else {
      const pw = pwSchema.safeParse(password);
      if (!pw.success) errs.password = pw.error.issues[0]?.message ?? "Invalid password.";
      if (confirm !== password) errs.confirm = "Passwords don't match.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    run(async () => {
      await verifyCaptcha();
      if (tab === "login") {
        await check(supabase.auth.signInWithPassword({ email: email.trim(), password }));
        done();
      } else {
        const { data } = await check(
          supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
              data: { display_name: displayName.trim() || undefined },
            },
          }),
        );
        if (data.session) return done();
        setOtp(Array(6).fill(""));
        setView("otp");
        setCooldown(30);
        setBanner({ kind: "success", text: "Account created! Check your inbox to confirm your email." });
      }
    });
  };

  const onVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return setErrors({ otp: "Enter all 6 digits." });
    setErrors({});
    run(async () => {
      await check(
        supabase.auth.verifyOtp({ email: email.trim(), token: code, type: view === "forgot-otp" ? "recovery" : "signup" }),
      );
      if (view === "forgot-otp") {
        setPassword("");
        setConfirm("");
        setView("forgot-new");
        setBanner({ kind: "success", text: "Code confirmed. Choose a new password." });
      } else done();
    });
  };

  const onForgotEmail = (e: FormEvent) => {
    e.preventDefault();
    const em = emailSchema.safeParse(email);
    if (!em.success) return setErrors({ email: em.error.issues[0]?.message ?? "Invalid email." });
    setErrors({});
    run(async () => {
      await check(
        supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` }),
      );
      setOtp(Array(6).fill(""));
      setView("forgot-otp");
      setCooldown(30);
      setBanner({ kind: "success", text: "If that email has an account, we've sent reset instructions." });
    });
  };

  const onNewPassword = (e: FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<"email"|"password"|"confirm", string>> = {};
    const pw = pwSchema.safeParse(password);
    if (!pw.success) errs.password = pw.error.issues[0]?.message ?? "Invalid password.";
    if (confirm !== password) errs.confirm = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    run(async () => {
      await check(supabase.auth.updateUser({ password }));
      done();
    });
  };

  const resend = () =>
    run(async () => {
      if (view === "forgot-otp") {
        await check(supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` }));
      } else {
        await check(supabase.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/dashboard` } }));
      }
      setCooldown(30);
      setBanner({ kind: "success", text: "A new email is on its way." });
    });

  const heading =
    view === "otp" || view === "forgot-otp"
      ? "Check your email"
      : view === "forgot-email"
        ? "Reset your password"
        : view === "forgot-new"
          ? "Set a new password"
          : tab === "login"
            ? "Welcome back"
            : "Create your account";

  return (
    <div className="relative flex min-h-screen items-center justify-center font-body text-ink">
      <img src={bg} alt="" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover blur-sm" />
      <div className="absolute inset-0 bg-ink/45" aria-hidden />

      <main
        className="relative mx-4 my-4 w-[90%] max-w-[420px] rounded-2xl bg-cream p-5 shadow-[0_8px_24px_oklch(0_0_0/0.15)] sm:w-full sm:p-8"
        onKeyDown={(e) => e.key === "Escape" && navigate({ to: "/" })}
      >
        <div className="flex items-center gap-2">
          <ShieldLogo />
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            M.O.M.M.A.
          </Link>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">{heading}</h1>

        {view === "form" && (
          <div role="tablist" aria-label="Log in or sign up" className="mt-5 flex border-b border-line">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`-mb-px flex-1 border-b-2 pb-2 text-sm font-semibold transition-colors ${
                  tab === t ? "border-brick text-ink" : "border-transparent text-ink/55 hover:text-ink"
                }`}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        <div aria-live="assertive" className="mt-4">
          {banner && (
            <div
              role={banner.kind === "error" ? "alert" : "status"}
              className={`rounded-lg px-3 py-2 text-sm ${
                banner.kind === "error" ? "bg-destructive/10 text-destructive" : "bg-moss/15 text-moss"
              }`}
            >
              {banner.text}
            </div>
          )}
        </div>

        <div className={`relative ${loading ? "pointer-events-none opacity-70" : ""}`}>
          {view === "form" && (
            <form onSubmit={onSubmitForm} noValidate className="mt-2 space-y-4">
              <Field id="email" label="Email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={onEmailBlur}
                  className={inputCls}
                  placeholder=" "
                />
              </Field>
              {captcha && (
                <MathCaptcha
                  a={captcha.a}
                  b={captcha.b}
                  value={captchaAnswer}
                  ok={captchaOk}
                  error={errors.captcha}
                  onChange={(v) => {
                    setCaptchaAnswer(v);
                    setErrors((e) => ({ ...e, captcha: "" }));
                  }}
                  onRefresh={newCaptcha}
                />
              )}
              <PasswordField id="password" label="Password" value={password} onChange={setPassword} error={errors.password} autoComplete={tab === "login" ? "current-password" : "new-password"} />
              {tab === "signup" && (
                <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" />
              )}
              {tab === "login" && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brick" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => { setView("forgot-email"); setErrors({}); setBanner(null); }} className="font-medium text-brick hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
              <SubmitButton loading={loading}>{tab === "login" ? "Log In" : "Sign Up"}</SubmitButton>
              <p className="text-center text-sm text-ink/70">
                {tab === "login" ? "New to MOMMA? " : "Already have an account? "}
                <button type="button" onClick={() => switchTab(tab === "login" ? "signup" : "login")} className="font-semibold text-brick hover:underline">
                  {tab === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            </form>
          )}

          {(view === "otp" || view === "forgot-otp") && (
            <form onSubmit={onVerifyOtp} className="mt-2 space-y-4">
              <p className="text-sm text-ink/70">
                Enter the 6-digit code we sent to <strong className="text-ink">{email}</strong>.
                <span className="block text-xs text-ink/50">Preview mode: use 123456.</span>
              </p>
              <OtpInput value={otp} onChange={setOtp} error={errors.otp} />
              <SubmitButton loading={loading}>Verify</SubmitButton>
              <p className="text-center text-sm">
                <button type="button" disabled={cooldown > 0} onClick={resend} className="font-medium text-brick hover:underline disabled:text-ink/40 disabled:no-underline">
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </p>
            </form>
          )}

          {view === "forgot-email" && (
            <form onSubmit={onForgotEmail} noValidate className="mt-2 space-y-4">
              <p className="text-sm text-ink/70">We'll email you a code to reset your password.</p>
              <Field id="femail" label="Email" error={errors.email}>
                <input id="femail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder=" " />
              </Field>
              <SubmitButton loading={loading}>Send code</SubmitButton>
              <BackLink onClick={() => switchTab("login")} />
            </form>
          )}

          {view === "forgot-new" && (
            <form onSubmit={onNewPassword} noValidate className="mt-2 space-y-4">
              <PasswordField id="npw" label="New password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
              <PasswordField id="ncf" label="Confirm new password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" />
              <SubmitButton loading={loading}>Update password</SubmitButton>
              <BackLink onClick={() => switchTab("login")} />
            </form>
          )}
        </div>

      </main>
    </div>
  );
}

const inputCls =
  "peer w-full rounded-lg border border-line bg-paper px-3 pb-2 pt-5 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/25";

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <div className="relative">
        {children}
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-1.5 text-xs text-ink/60 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PasswordField(p: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string | undefined; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field id={p.id} label={p.label} error={p.error}>
      <input id={p.id} type={show ? "text" : "password"} autoComplete={p.autoComplete} value={p.value} onChange={(e) => p.onChange(e.target.value)} className={`${inputCls} pr-10`} placeholder=" " />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-ink">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </Field>
  );
}

function MathCaptcha(p: { a: number; b: number; value: string; ok: boolean; error?: string | undefined; onChange: (v: string) => void; onRefresh: () => void }) {
  return (
    <div role="group" aria-label="Security check: solve the puzzle to continue" className="tag-mat rounded-lg border border-dashed border-line bg-paper/60 p-3">
      <div className="flex items-center gap-3">
        <label htmlFor="captcha" className="text-sm">
          Security check: what is <strong>{p.a} + {p.b}</strong>?
        </label>
        <input id="captcha" inputMode="numeric" maxLength={2} value={p.value} disabled={p.ok} onChange={(e) => p.onChange(e.target.value.replace(/\D/g, ""))} className="w-14 rounded-md border border-line bg-cream px-2 py-1 text-center text-sm outline-none focus:border-brick" />
        {p.ok ? (
          <span className="text-xs font-semibold text-moss">✓ Verified</span>
        ) : (
          <button type="button" onClick={p.onRefresh} className="text-xs text-ink/60 hover:text-ink">New one</button>
        )}
      </div>
      {p.error && <p className="mt-1 text-xs text-destructive">{p.error}</p>}
    </div>
  );
}

function OtpInput({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string | undefined }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => refs.current[0]?.focus(), []);
  const set = (i: number, d: string) => {
    const next = [...value];
    next[i] = d;
    onChange(next);
  };
  return (
    <div>
      <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
        {value.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            aria-label={`Digit ${i + 1}`}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              set(i, v);
              if (v && i < 5) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
            }}
            onPaste={(e) => {
              const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
              if (digits.length) {
                e.preventDefault();
                onChange([...digits, ...Array(6 - digits.length).fill("")]);
                refs.current[Math.min(digits.length, 5)]?.focus();
              }
            }}
            className="h-12 w-full rounded-lg border border-line bg-paper text-center font-display text-lg outline-none focus:border-brick focus:ring-2 focus:ring-brick/25"
          />
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brick py-2.5 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-brick/90 disabled:translate-y-0 disabled:opacity-70">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <p className="text-center text-sm">
      <button type="button" onClick={onClick} className="font-medium text-brick hover:underline">← Back to log in</button>
    </p>
  );
}

function ShieldLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" className="fill-brick" />
      <path d="m8.5 12 2.5 2.5 4.5-5" className="fill-none stroke-cream" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
