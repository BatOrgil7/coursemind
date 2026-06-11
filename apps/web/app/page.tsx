// Landing page — the brand pitch. "Use AI responsibly and actually learn"
// is the headline FEATURE, marketed loudly (product spec, Section 1).
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/ui";

const FEATURES = [
  {
    emoji: "📚",
    title: "Grounded in YOUR course",
    body: "Upload slides, notes, and past assignments. Every AI answer is grounded in your professor's actual materials — and flags clearly when it goes beyond them.",
  },
  {
    emoji: "🧭",
    title: "Hints, not handouts",
    body: "For graded work, the tutor escalates through four hint tiers as you engage — nudge, guiding question, worked analogy, structured walkthrough. The final answer is always yours.",
  },
  {
    emoji: "🧪",
    title: "Quizzes in your prof's style",
    body: "Turn any lecture into a practice quiz in seconds — MCQ, short answer, and code questions that mirror what your professor emphasizes, with explanations for every miss.",
  },
  {
    emoji: "🔍",
    title: "Pre-submit code review",
    body: "Paste your homework code before you turn it in. The AI points at bugs and edge cases with questions — \"what happens when the list is empty?\" — and never rewrites your code.",
  },
  {
    emoji: "🤝",
    title: "One class, one library",
    body: "Materials are shared with everyone in your course. One classmate's upload makes the AI smarter for the whole class.",
  },
  {
    emoji: "🔥",
    title: "Built for the long game",
    body: "Streaks, XP, weak-spot tracking, and spaced repetition keep you studying a little every day — the only way that actually works.",
  },
];

const TIERS = [
  { n: 1, name: "Nudge", desc: "“This is a load-factor question — check Lecture 9, section 5.”" },
  { n: 2, name: "Guiding question", desc: "“What happens to probe length as the table fills up?”" },
  { n: 3, name: "Analogous example", desc: "Teaches the idea, works a similar-but-different problem." },
  { n: 4, name: "Walkthrough", desc: "Outlines the steps. You still write your own answer." },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-950 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo dark />
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50">
              Get started
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
          <p className="mx-auto mb-6 inline-block rounded-full border border-brand-400/40 bg-brand-900/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-200">
            The responsible-AI study platform
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            Don&apos;t just get the answer.{" "}
            <span className="text-ember-400">Actually learn it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            CourseMind is an AI tutor grounded in your own course materials. It explains
            generously, quizzes you relentlessly, and guides you to your own answers on graded
            work — because the skill is the point.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup" className="rounded-xl bg-ember-500 px-6 py-3 font-semibold text-ink shadow-lift hover:bg-ember-400">
              Start learning free
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 hover:text-white">
              I have an account
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Try the demo: <span className="font-mono text-slate-300">alex@demo.edu</span> ·{" "}
            <span className="font-mono text-slate-300">coursemind</span>
          </p>
        </div>
      </section>

      {/* The tier ladder — the differentiator, shown proudly */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-display text-3xl font-bold">
          An AI that refuses to do your homework —{" "}
          <span className="text-brand-600">and that&apos;s the feature.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
          Ask a concept question, get a full, generous explanation. Ask for help on a graded
          assignment, and CourseMind walks UP this ladder only as you engage:
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div key={tier.n} className="card">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-display font-bold text-white">
                {tier.n}
              </div>
              <h3 className="font-display font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center font-display text-3xl font-bold">
            Everything you need to study smarter
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-100 bg-paper p-6">
                <div className="text-3xl">{feature.emoji}</div>
                <h3 className="mt-3 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section className="bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold">
            Your degree is the receipt. <span className="text-ember-400">The skill is the product.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Join with your university email — your whole class benefits from every upload.
          </p>
          <Link href="/signup" className="mt-8 inline-block rounded-xl bg-ember-500 px-8 py-3 font-semibold text-ink hover:bg-ember-400">
            Create your account
          </Link>
        </div>
        <footer className="border-t border-brand-900 py-8 text-center text-sm text-slate-400">
          <Logo dark /> — built to make you better, not dependent.
        </footer>
      </section>
    </main>
  );
}
