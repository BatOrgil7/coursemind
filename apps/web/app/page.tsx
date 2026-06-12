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
    body: "For graded work, Hyntor moves through hint tiers as you engage instead of dropping a final answer.",
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
    <main className="overflow-hidden bg-white">
      <section className="relative min-h-[86vh] bg-white text-ink">
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-24">
          <div>
            <h1 className="font-display text-6xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
              Hyntor
            </h1>
            <p className="mt-6 max-w-xl text-xl font-medium leading-relaxed text-slate-600">
              A clean AI study space for class materials, hints, practice, and focused tutoring.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Start learning free
              </Link>
              <Link href="/login" className="btn-secondary">
                Use demo account
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">
              Demo: <span className="font-mono text-slate-700">alex@demo.edu</span> /{" "}
              <span className="font-mono text-slate-700">coursemind</span>
            </p>
          </div>

          <div className="relative min-h-[430px] lg:min-h-[560px]" aria-hidden="true">
            <div className="absolute inset-x-4 top-0 rounded-lg border border-slate-200 bg-slate-100/80 p-3 shadow-card backdrop-blur-xl sm:inset-x-16">
              <div className="mx-auto h-6 w-24 rounded-full bg-black" />
              <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">AI Tutor</span>
                  <span className="text-xs font-semibold text-brand-600">CS201</span>
                </div>
                <div className="space-y-3">
                  <div className="ml-auto max-w-[78%] rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white">
                    Help me understand hashing.
                  </div>
                  <div className="max-w-[86%] rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                    Start with load factor. What happens as the table gets full?
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-400">Due cards</p>
                  <p className="mt-1 text-3xl font-semibold text-ink">12</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-400">Best quiz</p>
                  <p className="mt-1 text-3xl font-semibold text-ink">88%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div key={tier.n} className="card">
              <div className="icon-mark bg-brand-600">{tier.n}</div>
              <h3 className="mt-4 font-display font-semibold text-ink">{tier.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">Everything points back to learning.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card-interactive">
                <span className="icon-mark bg-slate-100 text-slate-700">{feature.mark}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Make class materials useful.</h2>
          <Link href="/signup" className="btn-primary w-full sm:w-auto">
            Create your account
          </Link>
        </div>
      </section>
    </main>
  );
}
