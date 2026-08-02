import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArenaShell, ActionButton, Alert, Field, Panel } from "@/components/arena-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create Profile — Matchforge Arena" },
      {
        name: "description",
        content: "Create your Matchforge Arena profile, upload your avatar, and start climbing the competitive ladder.",
      },
      { property: "og:title", content: "Create Profile — Matchforge Arena" },
      {
        property: "og:description",
        content: "Create your profile and start climbing the competitive ladder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function FileField({
  label,
  hint,
  onChange,
  required,
}: {
  label: string;
  hint: string;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <label className="group block cursor-pointer">
      <span className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        <span className="h-px w-3 bg-primary/40 transition-all group-hover:w-5 group-hover:bg-primary" />
        {label}
      </span>
      <div className="relative clip-blade border border-dashed border-border bg-background/40 backdrop-blur transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
        {preview ? (
          <div className="relative h-24 overflow-hidden">
            <img src={preview} alt="Preview" className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="mt-1 truncate px-4 font-mono text-[10px] text-primary">{name}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <div className="font-mono text-xs text-muted-foreground">{name || hint}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
                Click to browse
              </div>
            </div>
            <span className="clip-blade border border-primary/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary transition-all group-hover:bg-primary/10">
              Browse
            </span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          required={required}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setName(file?.name ?? "");
            onChange(file);
            if (file) {
              const url = URL.createObjectURL(file);
              setPreview(url);
            } else {
              setPreview(null);
            }
          }}
        />
      </div>
    </label>
  );
}

const STEPS = ["Account", "Identity", "Review", "Verification"] as const;

function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverimage, setCover] = useState<File | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmitRegistration(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const form = new FormData();
      form.append("username", username);
      form.append("email", email);
      form.append("password", password);
      if (avatar) form.append("avatar", avatar);
      if (coverimage) form.append("coverimage", coverimage);
      await api.register(form);
      await login({ identifier: username, password });
      setNotice("Account created. A 6-digit OTP has been sent to your email (expires in 1 hour).");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return;
    setBusy(true);
    setError(null);
    try {
      await api.verifyEmail(otp);
      router.navigate({ to: "/play" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setBusy(false);
    }
  }

  async function onResendOtp() {
    setBusy(true);
    setError(null);
    try {
      await api.resendOtp();
      setNotice("A new 6-digit OTP has been sent to your email (expires in 1 hour).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ArenaShell
      eyebrow="New Operative"
      title="Create your profile"
      subtitle="Your callsign and avatar appear in every lobby you drop into. Make them count."
    >
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center gap-0 animate-rise">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <button
                type="button"
                onClick={() => i < step && step < 3 && setStep(i)}
                className={`relative flex h-8 w-8 items-center justify-center clip-blade font-mono text-[10px] font-bold transition-all ${
                  i < step
                    ? "bg-primary/20 text-primary ring-1 ring-primary/40 cursor-pointer"
                    : i === step
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--color-primary)]"
                    : "bg-white/5 text-muted-foreground/50 cursor-default"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </button>
              <div className="flex items-center">
                <div className="mx-2 hidden sm:block">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {s}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-12 transition-all ${i < step ? "bg-primary/50" : "bg-white/10"}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <Panel
          padding="p-8 animate-rise"
          className="shadow-[0_8px_60px_-20px_rgba(0,0,0,0.8)]"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {step < 3 ? (
            <form onSubmit={onSubmitRegistration}>
              <div>
                {step === 0 && (
                  <div className="flex flex-col gap-5 animate-rise">
                    <Field
                      label="Callsign"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="shadowstrike"
                      required
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@arena.gg"
                      required
                    />
                    <Field
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-5 animate-rise">
                    <FileField
                      label="Avatar (required)"
                      hint="Select a profile image"
                      onChange={setAvatar}
                      required
                    />
                    <FileField
                      label="Cover image (optional)"
                      hint="Select a cover banner"
                      onChange={setCover}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-4 animate-rise">
                    <div className="font-display text-sm font-bold uppercase tracking-widest text-foreground mb-2">
                      Confirm your details
                    </div>
                    {[
                      { label: "Callsign", value: username },
                      { label: "Email", value: email },
                      { label: "Avatar", value: avatar?.name || "None" },
                      { label: "Cover", value: coverimage?.name || "None (optional)" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between clip-blade border border-border bg-background/30 px-4 py-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
                        <span className="font-mono text-xs text-foreground truncate max-w-[60%] text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Alert>{error}</Alert>
              </div>

              <div className="mt-8 -mx-8 -mb-8 border-t border-border bg-background/20 px-8 py-5 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:text-accent transition-colors">
                      Log in
                    </Link>
                  </p>
                )}

                {step < 2 ? (
                  <ActionButton
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={step === 0 && (!username || !email || !password)}
                  >
                    Continue →
                  </ActionButton>
                ) : (
                  <ActionButton type="submit" variant="accent" disabled={busy}>
                    {busy ? "Processing…" : "Create Account"}
                  </ActionButton>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="flex flex-col gap-5 animate-rise">
              <div className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                Email Verification
              </div>
              <div className="clip-blade border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
                  Enter the 6-digit OTP sent to {email} (expires in 1 hour).
                </p>
              </div>

              <Field
                label="6-Digit OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />

              <Alert>{error}</Alert>
              {notice && (
                <div className="clip-blade border border-primary/30 bg-primary/8 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {notice}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3">
                <ActionButton type="submit" variant="accent" disabled={busy || !otp}>
                  {busy ? "Verifying…" : "Verify & Complete"}
                </ActionButton>

                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={busy}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer text-center py-2"
                >
                  Resend OTP (1-Hr Expiry)
                </button>
              </div>
            </form>
          )}
        </Panel>
      </div>
    </ArenaShell>
  );
}
