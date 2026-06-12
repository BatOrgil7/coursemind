// Landing page: public product pitch.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/ui";

const FEATURES = [
  {
    mark: "MT",
    title: "Grounded in your course",
    body: "Upload slides, notes, homework, and tests. Tutor answers are shaped by the materials your class shares.",
  },
  {
    mark: "HW",
    title: "Hints before handouts",
    body: "For graded work, CourseMind moves through hint tiers as you engage instead of dropping a final answer.",
  },
  {
    mark: "QZ",
    title: "Practice from real lectures",
    body: "Turn class material into quizzes, explanations, and review loops that follow what your professor emphasizes.",
  },
  {
    mark: "RV",
    title: "Pre-submit code review",
    body: "Paste homework code and get questions about bugs, edge cases, and style without a rewritten solution.",
  },
  {
    mark: "CL",
    title: "One shared library",
    body: "One classmate's upload improves the tutor for everyone enrolled in the same course.",
  },
  {
    mark: "XP",
    title: "Built for follow-through",
    body: "Streaks, XP, weak-spot tracking, and study sessions keep learning moving day after day.",
  },
];

const TIERS = [
  { n: 1, name: "Nudge", desc: "Points you to the relevant idea or course section." },
  { n: 2, name: "Guiding question", desc: "Forces the next reasoning step instead of giving it away." },
  { n: 3, name: "Analogous example", desc: "Works a similar problem so the graded answer remains yours." },
  { n: 4, name: "Walkthrough", desc: "Outlines a path only after you have engaged with the work." },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[86vh] bg-brand-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(6,182,212,0.22),transparent_35%),linear-gradient(25deg,rgba(163,230,53,0.16),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo dark />
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-bold text-slate-200 transition hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-20">
          <div>
            <p className="eyebrow text-aqua-300">Responsible AI study platform</p>
            <h1 className="mt-4 font-display text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              CourseMind
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-slate-200">
              An AI tutor grounded in your class materials, built to help students understand the work without becoming dependent on answer dumps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Start learning free
              </Link>
              <Link href="/login" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                Use demo account
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-400">
              Demo: <span className="font-mono text-slate-200">alex@demo.edu</span> /{" "}
              <span className="font-mono text-slate-200">coursemind</span>
            </p>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[520px]" aria-hidden="true">
            <div className="absolute left-0 top-4 w-[82%] rounded-lg border border-white/20 bg-white/[0.08] p-4 shadow-lift backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-md bg-aqua-300 px-2 py-1 text-[10px] font-black text-ink">AI TUTOR</span>
                <span className="text-xs font-bold text-slate-300">CS201</span>
              </div>
              <div className="space-y-3">
                <div className="ml-auto h-12 w-3/4 rounded-lg bg-aqua-400/80" />
                <div className="h-28 rounded-lg bg-white/90 p-4">
                  <div className="mb-3 h-2 w-28 rounded bg-brand-300" />
                  <div className="mb-2 h-2 w-full rounded bg-slate-200" />
                  <div className="mb-2 h-2 w-5/6 rounded bg-slate-200" />
                  <div className="h-2 w-2/3 rounded bg-slate-200" />
                </div>
                <div className="h-10 w-2/3 rounded-lg bg-white/20" />
              </div>
            </div>
            <div className="absolute bottom-10 right-0 w-[72%] rounded-lg border border-white/20 bg-ink/80 p-4 shadow-lift backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-black text-lime-300">PRACTICE QUEUE</span>
                <span className="text-xs font-bold text-slate-400">12 questions</span>
              </div>
              {[72, 54, 86, 41].map((width, index) => (
                <div key={index} className="mb-3 rounded-lg bg-white/10 p-3">
                  <div className="mb-2 h-2 rounded bg-white/30" style={{ width: `${width}%` }} />
                  <div className="h-2 w-1/3 rounded bg-aqua-300/70" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div key={tier.n} className="card">
              <div className="icon-mark bg-gradient-to-br from-brand-600 to-aqua-500">{tier.n}</div>
              <h3 className="mt-4 font-display font-black text-ink">{tier.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">Study system</p>
            <h2 className="mt-2 font-display text-3xl font-black text-ink">Everything points back to learning.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card-interactive">
                <span className="icon-mark bg-slate-100 text-brand-700">{feature.mark}</span>
                <h3 className="mt-4 font-display text-lg font-black text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-aqua-300">Ready</p>
            <h2 className="mt-2 font-display text-3xl font-black">Make class materials useful.</h2>
          </div>
          <Link href="/signup" className="btn-primary w-full sm:w-auto">
            Create your account
          </Link>
        </div>
      </section>
    </main>
  );
}
