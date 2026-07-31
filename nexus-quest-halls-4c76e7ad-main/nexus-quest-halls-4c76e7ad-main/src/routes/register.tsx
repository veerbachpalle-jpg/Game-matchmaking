import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArenaShell, ActionButton, Alert, Field, Panel } from "@/components/arena-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create Profile — Nexus Arena" },
      {
        name: "description",
        content: "Create your Nexus Arena profile, upload your avatar, and start climbing the competitive ladder.",
      },
      { property: "og:title", content: "Create Profile — Nexus Arena" },
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
  return (
    <label className="block cursor-pointer">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 flex items-center justify-between gap-3 clip-blade border border-dashed border-input bg-surface/60 px-4 py-3">
        <span className="truncate text-sm text-muted-foreground">{name || hint}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Browse</span>
      </div>
      <input
        type="file"
        accept="image/*"
        required={required}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setName(file?.name ?? "");
          onChange(file);
        }}
      />
    </label>
  );
}

function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverimage, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("username", username);
      form.append("email", email);
      form.append("password", password);
      if (avatar) form.append("avatar", avatar);
      if (coverimage) form.append("coverimage", coverimage);
      await api.register(form);
      await login({ identifier: username, password });
      router.navigate({ to: "/play" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ArenaShell
      eyebrow="New Operative"
      title="Create your profile"
      subtitle="Your avatar and callsign appear in every lobby you drop into."
    >
      <div className="mx-auto max-w-md">
        <Panel>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
            <FileField label="Avatar (required)" hint="Select an image" onChange={setAvatar} required />
            <FileField label="Cover image (optional)" hint="Select an image" onChange={setCover} />
            <Alert>{error}</Alert>
            <ActionButton type="submit" variant="accent" disabled={busy}>
              {busy ? "Deploying…" : "Create account"}
            </ActionButton>
          </form>
        </Panel>
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="text-primary hover:text-accent">
            Log in
          </Link>
        </p>
      </div>
    </ArenaShell>
  );
}
