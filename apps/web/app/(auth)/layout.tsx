import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen px-4 py-6 lg:grid-cols-[1fr_440px] lg:gap-8 lg:px-8">
      <section className="hidden min-h-[calc(100vh-3rem)] rounded-lg bg-brand-950 p-8 text-white shadow-lift lg:flex lg:flex-col lg:justify-between">
        <div>
          <Logo dark />
          <p className="mt-8 eyebrow text-aqua-300">Course-grounded AI</p>
          <h1 className="mt-3 max-w-xl font-display text-5xl font-black tracking-tight">
            Learn from the materials your class actually uses.
          </h1>
        </div>
        <div className="grid gap-3">
          {["Shared course library", "Hint-tier assignment help", "Practice quizzes from lectures"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold backdrop-blur">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center">
        <Link href="/" className="mb-8 lg:hidden">
          <Logo />
        </Link>
        <div className="card w-full max-w-md">{children}</div>
        <p className="mt-6 max-w-md text-center text-xs font-medium text-slate-400">
          Demo account: <span className="font-mono text-slate-600">alex@demo.edu</span> /{" "}
          <span className="font-mono text-slate-600">coursemind</span>
        </p>
      </section>
    </main>
  );
}
