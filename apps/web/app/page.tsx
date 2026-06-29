// Landing page: public product pitch.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/ui";

const TRUST = [
  "Grounded in your course materials",
  "Hints, not answers, on graded work",
  "One shared library per class",
  "Tracks your weak spots",
];

const STEPS = [
  {
    n: 1,
    title: "Join your class",
    body: "Sign in with Google or your email, join your course, and add the slides, notes, and past materials your class actually uses.",
  },
  {
    n: 2,
    title: "Ask, practice, review",
    body: "Chat with a tutor grounded in those materials, turn lectures into quizzes and flashcards, and review your weak spots.",
  },
  {
    n: 3,
    title: "Earn deeper help",
    body: "On graded work the tutor gives a nudge first, then guides further as you engage — so the final answer stays yours.",
  },
];

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
    body: "Streaks, XP, weak-spot tracking, and study plans keep learning moving day after day.",
  },
];

const TIERS = [
  { n: 1, name: "Nudge", desc: "Points you to the relevant idea or course section." },
  { n: 2, name: "Guiding question", desc: "Forces the next reasoning step instead of giving it away." },
  { n: 3, name: "Analogous example", desc: "Works a similar problem so the graded answer stays yours." },
  { n: 4, name: "Walkthrough", desc: "Outlines a path only after you have engaged with the work." },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="overflow-hidden">
      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60rem 40rem at 70% -10%, rgba(10,132,255,0.16), transparent 60%), radial-gradient(50rem 40rem at 0% 10%, rgba(10,132,255,0.08), transparent 55%)",
          }}
          aria-hidden="true"
        />
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-ink"
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 ring-1 ring-brand-100">
              Responsible AI for university courses
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Study from what your class actually teaches.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-slate-600">
              Hyntor is an AI study partner grounded in your course&apos;s own materials. It explains
              concepts generously — and on graded work it guides you with escalating hints instead of
              handing over the answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-5 py-3 text-base">
                Get started — it&apos;s free
              </Link>
              <Link href="/login" className="btn-secondary px-5 py-3 text-base">
                Log in
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">
              Free to start · Google or school email · Built for real coursework
            </p>
          </div>

          {/* Product preview */}
          <div className="relative" aria-hidden="true">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-lift backdrop-blur-xl">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="ml-3 text-xs font-medium text-slate-400">hyntor · CS201 tutor</span>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">
                    How do I solve this hashing problem on the homework?
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-brand-100">
                      Tier 2 · Guiding question
                    </span>
                    <p>
                      Look at your <span className="font-semibold">Lecture 9</span> notes on load factor.
                      What happens to lookups as the table fills past ~70%?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { label: "Due cards", value: "12" },
                  { label: "Best quiz", value: "88%" },
                  { label: "Streak", value: "6d" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white p-3 text-center shadow-sm">
                    <p className="font-display text-2xl font-semibold text-ink">{s.value}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="surface-panel grid gap-3 px-5 py-4 text-sm font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink">
            Set up in minutes, then study smarter.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="card">
                <div className="icon-mark bg-brand-600 text-base">{step.n}</div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Hint tiers ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">The hint-tier system</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
              Help that escalates only as you engage.
            </h2>
            <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
              On anything graded, Hyntor starts with the smallest useful hint and goes deeper the more
              you work — never straight to the answer.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div key={tier.n} className="card-interactive">
                <div className="icon-mark bg-brand-600">{tier.n}</div>
                <h3 className="mt-4 font-display font-semibold text-ink">{tier.name}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">Everything in one place</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
              Everything points back to learning.
            </h2>
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

      {/* ---------- Responsible-AI band ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="overflow-hidden rounded-2xl bg-brand-950 px-8 py-12 text-white sm:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-300">
              Built to be trusted
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              It won&apos;t do your homework for you — and that&apos;s the point.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-brand-100">
              Hyntor is designed for students who want to actually understand the material. Concept
              questions get full explanations; graded work gets guidance that keeps the thinking — and
              the answer — yours.
            </p>
            <Link href="/signup" className="mt-7 inline-flex rounded-lg bg-white px-5 py-3 text-base font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50">
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-slate-200 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-sm font-medium text-slate-500">
              Don&apos;t just get the answer. Actually learn it.
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm font-semibold text-slate-600">
            <Link href="/login" className="hover:text-ink">Log in</Link>
            <Link href="/signup" className="hover:text-ink">Get started</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
