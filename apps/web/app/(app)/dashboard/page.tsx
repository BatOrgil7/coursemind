import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import { EmptyState, ModeBadge, PageHeader, TierBadge } from "@/components/ui";

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
        title={`Hey ${me.name.split(" ")[0]} 👋`}
        subtitle="What are we learning today?"
      />

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/tutor" className="card transition hover:shadow-lift">
          <div className="text-2xl">🧠</div>
          <p className="mt-2 font-display font-semibold">Ask the tutor</p>
          <p className="mt-1 text-sm text-slate-500">Concept questions, assignment hints, debugging.</p>
        </Link>
        <Link href="/courses" className="card transition hover:shadow-lift">
          <div className="text-2xl">🧪</div>
          <p className="mt-2 font-display font-semibold">Practice a quiz</p>
          <p className="mt-1 text-sm text-slate-500">Generate questions from any course material.</p>
        </Link>
        <Link href="/code-review" className="card transition hover:shadow-lift">
          <div className="text-2xl">🔍</div>
          <p className="mt-2 font-display font-semibold">Review my code</p>
          <p className="mt-1 text-sm text-slate-500">Catch bugs before you submit — without rewrites.</p>
        </Link>
      </div>

      {/* Courses */}
      <h2 className="mb-3 font-display text-lg font-semibold">Your courses</h2>
      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          body="Join an existing course or create one — then upload materials so the AI tutor can ground its answers in YOUR class."
          cta="Browse courses"
          href="/courses"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="card transition hover:shadow-lift">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wide text-brand-600">
                  {course.code}
                </span>
                <span className="text-xs text-slate-400">{course.memberCount} enrolled</span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold">{course.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>
              <p className="mt-3 text-xs text-slate-400">
                {course.materialCount} materials · {course.quizCount} quizzes
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Recent tutor sessions */}
      {sessions.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-display text-lg font-semibold">Recent tutor sessions</h2>
          <div className="card divide-y divide-slate-100 p-0">
            {sessions.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                href={`/tutor/${s.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {s.courseCode ?? "No course"} · {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ModeBadge mode={s.mode} />
                  {s.mode === "ASSIGNMENT_HELP" && s.tierReached > 0 && <TierBadge tier={s.tierReached} />}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
