"use client";

// Pre-submit code review: paste homework code, get pointed questions —
// never rewrites. Creates a CODE_REVIEW tutor session with the code as
// the first message, then drops into the normal chat.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { PageHeader } from "@/components/ui";

type Course = Awaited<ReturnType<typeof api.course.listMine.query>>[number];

export default function CodeReviewPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [context, setContext] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.course.listMine
      .query()
      .then((mine) => {
        setCourses(mine);
        setCourseId(mine[0]?.id ?? "");
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { id } = await api.tutor.createSession.mutate({
        mode: "CODE_REVIEW",
        courseId: courseId || null,
      });
      const firstMessage = `${context.trim() ? `What this code should do: ${context.trim()}\n\n` : ""}\`\`\`\n${code}\n\`\`\``;
      await api.tutor.sendMessage.mutate({ sessionId: id, content: firstMessage });
      router.push(`/tutor/${id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pre-submit code review"
        subtitle="Paste your homework code before turning it in. You'll get pointed questions about bugs, edge cases, and style — and zero rewritten code. Finding the fix is the workout."
      />
      <form onSubmit={submit} className="card max-w-3xl space-y-4">
        <div>
          <label className="label">Course (optional — grounds review in course materials)</label>
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">What is this code supposed to do?</label>
          <input
            className="input"
            placeholder="e.g. Insert a key into a hash table with linear probing"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Your code</label>
          <textarea
            className="input font-mono text-xs"
            rows={16}
            required
            placeholder="Paste your code here…"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={busy || !code.trim()} className="btn-primary">
          {busy ? "Reviewing… (~20s)" : "🔍 Review my code"}
        </button>
      </form>
    </div>
  );
}
