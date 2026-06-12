"use client";

// Smart-study hub for one course.
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { EmptyState, PageHeader } from "@/components/ui";

type Dashboard = Awaited<ReturnType<typeof api.study.courseDashboard.query>>;
type DueCard = Awaited<ReturnType<typeof api.flashcard.due.query>>[number];

const RATING_LABELS = {
  AGAIN: "Again",
  HARD: "Hard",
  GOOD: "Good",
  EASY: "Easy",
} as const;

export default function SmartStudyPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [examDate, setExamDate] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [dashboard, cards] = await Promise.all([
        api.study.courseDashboard.query({ courseId }),
        api.flashcard.due.query({ courseId, limit: 10 }),
      ]);
      setData(dashboard);
      setDueCards(cards);
      setSelectedMaterialId((current) => current || dashboard.materials.find((m) => m.hasText)?.id || "");
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const currentCard = dueCards[0] ?? null;
  const plan = data?.plans[0] ?? null;
  const readableMaterials = useMemo(
    () => data?.materials.filter((material) => material.hasText) ?? [],
    [data?.materials]
  );

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const selectedExamDate = String(form.get("examDate") || examDate);
    if (!selectedExamDate) return;
    setBusy("plan");
    setError(null);
    setNotice(null);
    try {
      await api.study.createPlan.mutate({ courseId, examDate: selectedExamDate });
      setNotice("Study plan created.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function togglePlanDay(planId: string, date: string, done: boolean) {
    setBusy(`day:${date}`);
    try {
      await api.study.toggleDay.mutate({ planId, date, done });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function generateFlashcards() {
    if (!selectedMaterialId) return;
    setBusy("flashcards");
    setNotice(null);
    setError(null);
    try {
      const result = await api.flashcard.generate.mutate({
        courseId,
        materialId: selectedMaterialId,
        cardCount: 12,
      });
      setNotice(`${result.count} flashcards added to your review queue.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function reviewFlashcard(rating: keyof typeof RATING_LABELS) {
    if (!currentCard) return;
    setBusy(`review:${rating}`);
    try {
      await api.flashcard.review.mutate({ flashcardId: currentCard.id, rating });
      setDueCards((cards) => cards.slice(1));
      setRevealed(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function generateMockExam() {
    setBusy("mock");
    setNotice(null);
    setError(null);
    try {
      const { id } = await api.quiz.generateMockExam.mutate({
        courseId,
        questionCount: 14,
        timeLimit: 75,
      });
      router.push(`/quizzes/${id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  }

  if (!data && !error) {
    return <p className="py-12 text-center text-sm font-medium text-slate-400">Loading smart study tools...</p>;
  }

  return (
    <div>
      <PageHeader
        title="Smart study"
        subtitle={data ? `${data.course.code} - ${data.course.title}` : "Study planning"}
        action={
          <Link href={`/courses/${courseId}`} className="btn-secondary">
            Back to course
          </Link>
        }
      />

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{notice}</p>}

      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="card">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="eyebrow">Exam prep</p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-ink">Study plan</h2>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                    Schedule review around course materials, syllabus text, and missed quiz topics.
                  </p>
                </div>
                <form onSubmit={createPlan} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    name="examDate"
                    type="date"
                    className="input sm:w-40"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={busy === "plan"} className="btn-primary">
                    {busy === "plan" ? "Planning..." : "Create plan"}
                  </button>
                </form>
              </div>

              {plan ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-500">
                    Latest plan for {new Date(plan.examDate).toLocaleDateString()}.
                  </p>
                  <div className="space-y-2">
                    {plan.schedule.map((day) => (
                      <label
                        key={day.date}
                        className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                          day.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white/75"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-brand-600"
                          checked={day.done}
                          disabled={busy === `day:${day.date}`}
                          onChange={(e) => togglePlanDay(plan.id, day.date, e.target.checked)}
                        />
                        <span className="min-w-28 font-mono text-xs font-semibold text-slate-500">
                          {day.date}
                        </span>
                        <span className="flex-1">
                          <span className="font-semibold text-ink">{day.topics.join(", ")}</span>
                          <span className="ml-2 text-xs font-medium text-slate-400">{day.minutes} min</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No plan yet"
                  body="Pick an exam date and Hyntor will turn your shared course context into a realistic study schedule."
                />
              )}
            </div>

            <div className="card">
              <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="eyebrow">Memory</p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-ink">Flashcards</h2>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                    Generate cards from shared materials, then review due cards with spaced repetition.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    className="input sm:w-64"
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    disabled={readableMaterials.length === 0}
                  >
                    {readableMaterials.length === 0 ? (
                      <option>No readable materials</option>
                    ) : (
                      readableMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.title}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={generateFlashcards}
                    disabled={busy === "flashcards" || !selectedMaterialId}
                  >
                    {busy === "flashcards" ? "Generating..." : "Generate 12 cards"}
                  </button>
                </div>
              </div>

              {currentCard ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Due now
                  </p>
                  <p className="mt-2 whitespace-pre-wrap font-display text-xl font-semibold text-ink">
                    {currentCard.front}
                  </p>
                  {revealed ? (
                    <>
                      <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                        {currentCard.back}
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-4">
                        {Object.entries(RATING_LABELS).map(([rating, label]) => (
                          <button
                            key={rating}
                            className="btn-secondary"
                            disabled={busy === `review:${rating}`}
                            onClick={() => reviewFlashcard(rating as keyof typeof RATING_LABELS)}
                          >
                            {label} - {currentCard.previews[rating as keyof typeof RATING_LABELS]}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button type="button" className="btn-primary mt-4" onClick={() => setRevealed(true)}>
                      Reveal answer
                    </button>
                  )}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-medium text-slate-500">
                  No cards due right now. Generate cards from a material to start reviewing.
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="card">
              <p className="eyebrow">Focus</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">Weak spots</h2>
              {data.weakTopics.length === 0 ? (
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                  Missed quiz topics will show up here after you take practice quizzes.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.weakTopics.slice(0, 8).map((topic) => (
                    <div key={topic.topic}>
                      <div className="mb-1 flex justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-600">{topic.topic}</span>
                        <span className="font-medium text-slate-400">{topic.count} miss{topic.count === 1 ? "" : "es"}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-coral-400"
                          style={{ width: `${Math.min(100, topic.count * 24)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <p className="eyebrow">Timed practice</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">Mock exam</h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Generate a timed exam across the whole shared course library.
              </p>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={generateMockExam}
                disabled={busy === "mock"}
              >
                {busy === "mock" ? "Generating exam..." : "Generate mock exam"}
              </button>
            </div>

            <div className="card">
              <p className="eyebrow">Review queue</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="metric-tile">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Due</dt>
                  <dd className="font-display text-2xl font-semibold text-ink">{data.flashcards.due}</dd>
                </div>
                <div className="metric-tile">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</dt>
                  <dd className="font-display text-2xl font-semibold text-ink">{data.flashcards.total}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
