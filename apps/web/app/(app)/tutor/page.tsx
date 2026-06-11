"use client";

// Tutor hub: start a new session (pick mode + course) or resume one.
// The mode picker is deliberately prominent — choosing "Assignment help"
// vs "Learn a concept" is what arms the right tutor behavior.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { MODE_META, ModeBadge, PageHeader, TierBadge } from "@/components/ui";

type Course = Awaited<ReturnType<typeof api.course.listMine.query>>[number];
type Session = Awaited<ReturnType<typeof api.tutor.listSessions.query>>[number];

function TutorHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mode, setMode] = useState<string>("CONCEPT");
  const [courseId, setCourseId] = useState<string>(searchParams.get("courseId") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [myCourses, mySessions] = await Promise.all([
          api.course.listMine.query(),
          api.tutor.listSessions.query(),
        ]);
        setCourses(myCourses);
        setSessions(mySessions);
        // Default to the first course — grounded answers are the whole point.
        setCourseId((current) => current || (myCourses[0]?.id ?? ""));
      } catch (err) {
        setError(errorMessage(err));
      }
    })();
  }, []);

  async function startSession() {
    setBusy(true);
    setError(null);
    try {
      const { id } = await api.tutor.createSession.mutate({
        mode: mode as "CONCEPT" | "ASSIGNMENT_HELP" | "CODE_REVIEW" | "DEBUG",
        courseId: courseId || null,
      });
      router.push(`/tutor/${id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Tutor"
        subtitle="Grounded in your course's shared materials. Generous with concepts, careful with answers."
      />

      <div className="card mb-8">
        <h2 className="mb-4 font-display font-semibold">Start a session</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(MODE_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                mode === key
                  ? "border-brand-600 bg-brand-50"
                  : "border-slate-200 bg-white hover:border-brand-300"
              }`}
            >
              <p className="font-display font-semibold">
                {meta.emoji} {meta.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">{meta.blurb}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <label className="label">Course (grounds the AI in its materials)</label>
            <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">No course — general tutoring</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <button onClick={startSession} disabled={busy} className="btn-primary">
            {busy ? "Starting…" : "Start session →"}
          </button>
        </div>
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Past sessions</h2>
      {sessions.length === 0 ? (
        <p className="card text-sm text-slate-500">No sessions yet — start your first one above.</p>
      ) : (
        <div className="card divide-y divide-slate-100 p-0">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/tutor/${s.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {s.courseCode ?? "No course"} · {new Date(s.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ModeBadge mode={s.mode} />
                {s.mode === "ASSIGNMENT_HELP" && s.tierReached > 0 && <TierBadge tier={s.tierReached} />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense>
      <TutorHub />
    </Suspense>
  );
}
