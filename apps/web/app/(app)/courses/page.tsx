"use client";

// Courses hub: my courses, browse/search all courses, join, create.
// Client component because join/create/search are interactive.
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { PageHeader } from "@/components/ui";

type BrowseCourse = Awaited<ReturnType<typeof api.course.browse.query>>[number];

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<BrowseCourse[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", subject: "", description: "" });
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
        subtitle="Join your class — or be the first to create it."
        action={
          <button className="btn-primary" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Cancel" : "+ Create course"}
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
              placeholder="Data Structures & Algorithms"
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
          <button type="submit" disabled={busy} className="btn-primary sm:col-span-2">
            {busy ? "Creating…" : "Create & join"}
          </button>
        </form>
      )}

      <div className="mb-6 flex gap-3">
        <input
          className="input"
          placeholder="Search by code, title, or subject…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(query)}
        />
        <button className="btn-secondary shrink-0" onClick={() => load(query)}>
          Search
        </button>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-400">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          No courses found — create the first one for your class!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="card flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wide text-brand-600">
                  {course.code}
                </span>
                <span className="text-xs text-slate-400">
                  {course.memberCount} enrolled · {course.materialCount} materials
                </span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold">{course.title}</p>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{course.description}</p>
              <div className="mt-4">
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
