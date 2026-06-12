"use client";

// Courses hub: my courses, browse/search all courses, join, create.
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { CrossUniversityBadge, PageHeader } from "@/components/ui";

type BrowseCourse = Awaited<ReturnType<typeof api.course.browse.query>>[number];

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<BrowseCourse[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    subject: "",
    description: "",
    isCrossUniversity: false,
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      setCourses(await api.course.browse.query({ query: q || undefined }));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load("");
  }, [load]);

  async function handleJoin(courseId: string) {
    try {
      await api.course.join.mutate({ courseId });
      router.push(`/courses/${courseId}`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { id } = await api.course.create.mutate(form);
      router.push(`/courses/${id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Join your class, or be the first to create it."
        action={
          <button className="btn-primary" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Cancel" : "Create course"}
          </button>
        }
      />

      {showCreate && (
        <form onSubmit={handleCreate} className="card mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Course code</label>
            <input
              className="input"
              placeholder="CS201"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              className="input"
              placeholder="Computer Science"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="Data Structures and Algorithms"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <label className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-slate-600 sm:col-span-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-brand-600"
              checked={form.isCrossUniversity}
              onChange={(e) => setForm({ ...form, isCrossUniversity: e.target.checked })}
            />
            <span>
              <strong className="text-ink">Cross-university course.</strong> Students from any university can discover and join it.
            </span>
          </label>
          <button type="submit" disabled={busy} className="btn-primary sm:col-span-2">
            {busy ? "Creating..." : "Create and join"}
          </button>
        </form>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="input"
          placeholder="Search by code, title, or subject..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(query)}
        />
        <button className="btn-secondary shrink-0" onClick={() => load(query)}>
          Search
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

      {loading ? (
        <p className="py-12 text-center text-sm font-medium text-slate-400">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="py-12 text-center text-sm font-medium text-slate-400">
          No courses found. Create the first one for your class.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="card-interactive flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="flex flex-wrap items-center gap-2 font-mono text-xs font-black uppercase tracking-wide text-aqua-600">
                  {course.code}
                  {course.isCrossUniversity && <CrossUniversityBadge />}
                </span>
                <span className="text-right text-xs font-bold text-slate-400">
                  {course.memberCount} enrolled - {course.materialCount} materials
                </span>
              </div>
              <p className="mt-3 font-display text-lg font-black text-ink">{course.title}</p>
              <p className="mt-1 line-clamp-2 flex-1 text-sm font-medium leading-relaxed text-slate-500">{course.description}</p>
              <div className="mt-5">
                {course.joined ? (
                  <Link href={`/courses/${course.id}`} className="btn-secondary w-full">
                    Open course
                  </Link>
                ) : (
                  <button className="btn-primary w-full" onClick={() => handleJoin(course.id)}>
                    Join course
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
