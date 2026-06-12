import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import { EmptyState, ModeBadge, PageHeader, TierBadge } from "@/components/ui";

const QUICK_ACTIONS = [
  {
    href: "/tutor",
    mark: "AI",
    title: "Ask the tutor",
    body: "Concept questions, assignment hints, debugging, and code review.",
  },
  {
    href: "/courses",
    mark: "QZ",
    title: "Practice a quiz",
    body: "Generate questions from course materials and review weak spots.",
  },
  {
    href: "/code-review",
    mark: "RV",
    title: "Review my code",
    body: "Catch bugs and edge cases before you submit.",
  },
];

export default async function DashboardPage() {
  const api = await serverApi();
  const [me, courses, sessions] = await Promise.all([
    api.user.me(),
    api.course.listMine(),
    api.tutor.listSessions(),
  ]);

  return (
    <div>
      <PageHeader
        title={`Hey ${me.name.split(" ")[0]}`}
        subtitle="Pick up where you left off, or start a focused study session."
      />

      <section className="surface-panel mb-8 overflow-hidden p-6">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="eyebrow">Today</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Study with your class context in view.</h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
              Shared materials, practice, and tutor sessions all build around the same course library.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="metric-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Streak</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{me.streakCount} days</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">XP</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{me.xp}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Courses</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{courses.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} className="card-interactive block">
            <span className="icon-mark bg-brand-600">{action.mark}</span>
            <p className="mt-4 font-display font-semibold text-ink">{action.title}</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{action.body}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl font-semibold text-ink">Your courses</h2>
      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          body="Join an existing course or create one, then upload materials so the AI tutor can ground its answers in your class."
          cta="Browse courses"
          href="/courses"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="card-interactive block">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {course.code}
                </span>
                <span className="text-xs font-bold text-slate-400">{course.memberCount} enrolled</span>
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-ink">{course.title}</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">{course.description}</p>
              <p className="mt-4 text-xs font-bold text-slate-400">
                {course.materialCount} materials - {course.quizCount} quizzes
              </p>
            </Link>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">Recent tutor sessions</h2>
          <div className="surface-panel divide-y divide-slate-100/80 overflow-hidden">
            {sessions.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                href={`/tutor/${s.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/70"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    {s.courseCode ?? "No course"} - {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ModeBadge mode={s.mode} />
                  {s.mode === "ASSIGNMENT_HELP" && s.tierReached > 0 && <TierBadge tier={s.tierReached} />}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
