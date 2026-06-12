"use client";

// Discussion board for a course: threads about the course in general or
// attached to an exam, quiz, or material (contextType). Exam threads are
// where the AI tutor's public hint discipline matters most.
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { CONTEXT_TYPE_META, ContextTypeBadge, EmptyState, PageHeader } from "@/components/ui";
import { THREAD_CONTEXT_TYPES } from "@coursemind/core";

type Payload = Awaited<ReturnType<typeof api.discussion.listByCourse.query>>;
type ContextType = (typeof THREAD_CONTEXT_TYPES)[number];

export default function DiscussionsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [filter, setFilter] = useState<ContextType | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", contextType: "COURSE" as ContextType, body: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (f: ContextType | "ALL") => {
      try {
        setData(
          await api.discussion.listByCourse.query({
            courseId,
            contextType: f === "ALL" ? undefined : f,
          })
        );
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [courseId]
  );

  useEffect(() => {
    void load(filter);
  }, [load, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { id } = await api.discussion.create.mutate({
        courseId,
        title: form.title,
        contextType: form.contextType,
        body: form.body,
      });
      router.push(`/discussions/${id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (!data && !error) {
    return <p className="py-12 text-center text-sm text-slate-400">Loading discussions…</p>;
  }

  return (
    <div>
      <PageHeader
        title="💬 Discussions"
        subtitle={
          data
            ? `${data.course.code} — ask the class, compare approaches, prep for exams`
            : "Ask the class, compare approaches, prep for exams"
        }
        action={
          <div className="flex gap-3">
            <Link href={`/courses/${courseId}`} className="btn-secondary">
              ← Back to course
            </Link>
            <button className="btn-primary" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? "Cancel" : "+ New thread"}
            </button>
          </div>
        }
      />

      {showCreate && (
        <form onSubmit={handleCreate} className="card mb-8 grid gap-4">
          <div>
            <label className="label">What's this thread about?</label>
            <div className="flex flex-wrap gap-2">
              {THREAD_CONTEXT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setForm({ ...form, contextType: type })}
                  className={`rounded-xl border-2 px-3 py-1.5 text-sm font-medium transition ${
                    form.contextType === type
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
                  }`}
                >
                  {CONTEXT_TYPE_META[type].emoji} {CONTEXT_TYPE_META[type].label}
                </button>
              ))}
            </div>
            {form.contextType === "EXAM" && (
              <p className="mt-2 text-xs text-amber-700">
                📝 Exam thread: if you invoke the AI tutor here, it gives hints and analogous
                examples only — never answers to graded questions.
              </p>
            )}
          </div>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="e.g. Midterm 2 — how deep do we need to know AVL rotations?"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">First post</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Lay out your question or kick off the discussion…"
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Posting…" : "Start thread"}
          </button>
        </form>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["ALL", ...THREAD_CONTEXT_TYPES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === f
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "ALL" ? "All threads" : `${CONTEXT_TYPE_META[f].emoji} ${CONTEXT_TYPE_META[f].label}`}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {data &&
        (data.threads.length === 0 ? (
          <EmptyState
            title={filter === "ALL" ? "No threads yet" : "No threads here yet"}
            body="Start the first discussion — and pull the AI tutor in whenever the thread gets stuck. It hints, it never answer-dumps."
          />
        ) : (
          <div className="card divide-y divide-slate-100 p-0">
            {data.threads.map((t) => (
              <Link
                key={t.id}
                href={`/discussions/${t.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    by {t.creatorName} · {t.postCount} post{t.postCount === 1 ? "" : "s"} · last
                    activity {new Date(t.lastPostAt).toLocaleDateString()}
                    {t.lastPostByTutor && " · 🧠 tutor replied"}
                  </p>
                </div>
                <ContextTypeBadge type={t.contextType} />
              </Link>
            ))}
          </div>
        ))}
    </div>
  );
}
