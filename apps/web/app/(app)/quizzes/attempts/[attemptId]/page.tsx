// Quiz results & review — every question shows the correct answer, the
// student's answer, AI feedback, and the explanation. Misses are the
// valuable part: their topics feed the weak-spot tracking (Phase 3).
import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import { PageHeader } from "@/components/ui";

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
}

export default async function AttemptReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const api = await serverApi();
  const attempt = await api.quiz.attempt({ attemptId });

  return (
    <div>
      <PageHeader
        title={attempt.quizTitle}
        subtitle={`Attempt from ${new Date(attempt.createdAt).toLocaleString()}`}
        action={
          <div className="flex gap-3">
            <Link href={`/quizzes/${attempt.quizId}`} className="btn-secondary">
              Retake quiz
            </Link>
            <Link href={`/courses/${attempt.courseId}`} className="btn-primary">
              Back to course
            </Link>
          </div>
        }
      />

      {/* Score hero */}
      <div className="card mb-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm text-slate-500">Your score</p>
          <p className={`font-display text-5xl font-bold ${scoreColor(attempt.score)}`}>
            {attempt.score}%
          </p>
        </div>
        {attempt.weakTopics.length > 0 && (
          <div className="max-w-md">
            <p className="text-sm font-semibold text-slate-600">Topics to revisit:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {attempt.weakTopics.map((topic) => (
                <span key={topic} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {topic}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Ask the tutor about these — that&apos;s exactly what it&apos;s for.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {attempt.review.map(({ question, answer }, index) => {
          const verdict =
            answer?.correct === true ? "correct" : answer?.correct === false ? "wrong" : "ungraded";
          return (
            <div
              key={question.id}
              className={`card border-l-4 ${
                verdict === "correct"
                  ? "border-l-emerald-400"
                  : verdict === "wrong"
                    ? "border-l-rose-400"
                    : "border-l-slate-300"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Question {index + 1} · {question.topic}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    verdict === "correct"
                      ? "bg-emerald-100 text-emerald-800"
                      : verdict === "wrong"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {verdict === "correct" ? "✓ Correct" : verdict === "wrong" ? "✗ Incorrect" : "Self-check"}
                </span>
              </div>
              <p className="whitespace-pre-wrap font-medium">{question.prompt}</p>

              {question.type === "mcq" && question.options ? (
                <div className="mt-3 space-y-1.5">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.correctOption;
                    const isChosen = answer?.response === String(optionIndex);
                    return (
                      <p
                        key={optionIndex}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isCorrect
                            ? "bg-emerald-50 font-semibold text-emerald-800"
                            : isChosen
                              ? "bg-rose-50 text-rose-800 line-through"
                              : "text-slate-500"
                        }`}
                      >
                        {isCorrect ? "✓ " : isChosen ? "✗ " : ""}
                        {option}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your answer</p>
                    <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs">
                      {answer?.response || "(no answer)"}
                    </p>
                  </div>
                  {question.sampleAnswer && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sample answer</p>
                      <p className="mt-1 whitespace-pre-wrap rounded-xl bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-900">
                        {question.sampleAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {answer?.feedback && (
                <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">
                  <span className="font-semibold">Feedback:</span> {answer.feedback}
                </p>
              )}
              {question.explanation && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Why:</span> {question.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
