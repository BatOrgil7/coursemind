"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { api, errorMessage } from "@/lib/trpc";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.user.signup.mutate({ name, email, password });
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) throw new Error("Account created, but auto-login failed. Please log in.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Start studying</p>
      <h1 className="mt-2 font-display text-2xl font-black text-ink">Create your account</h1>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
        Use your university email so CourseMind can connect you with classmates, courses, and shared materials.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name"
            required
            className="input"
            placeholder="Alex Demo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="email">University email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password (8+ characters)</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm font-medium text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-black text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
