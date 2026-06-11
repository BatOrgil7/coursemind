import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import { EmptyState, MaterialTypeBadge, PageHeader } from "@/components/ui";
import { GenerateQuizButton } from "@/components/GenerateQuizButton";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const api = await serverApi();
  const course = await api.course.get({ courseId });

  return (
    <div>
      <PageHeader
        title={`${course.code} — ${course.title}`}
        subtitle={`${course.subject} · ${course.memberCount} enrolled`}
        action={
          <div className="flex gap-3">
            <Link href={`/tutor?courseId=${course.id}`} className="btn-secondary">
              🧠 Ask the tutor
            </Link>
            <Link href={`/courses/${course.id}/upload`} className="btn-primary">
              + Upload material
            </Link>
          </div>
        }
      />
      {course.description && <p className="mb-8 max-w-3xl text-sm text-slate-600">{course.description}</p>}

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Shared material library */}
        <section className="lg:col-span-3">
          <h2 className="mb-3 font-display text-lg font-semibold">
            📚 Shared library{" "}
            <span className="text-sm font-normal text-slate-400">
              — every upload helps the whole class
            </span>
          </h2>
          {course.materials.length === 0 ? (
            <EmptyState
              title="No materials yet"
              body="Be the hero: upload the first lecture notes, slides, or syllabus. The AI tutor gets dramatically better once it can ground answers in your professor's actual materials."
              cta="Upload the first material"
              href={`/courses/${course.id}/upload`}
            />
          ) : (
            <div className="space-y-3">
              {course.materials.map((material) => (
                <div key={material.id} className="card flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link
                      href={`/materials/${material.id}`}
                      className="font-medium text-ink hover:text-brand-700 hover:underline"
                    >
                      {material.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      <MaterialTypeBadge type={material.type} /> · by {material.uploaderName} ·{" "}
                      {new Date(material.createdAt).toLocaleDateString()}
                      {!material.hasText && (
                        <span className="ml-2 text-amber-600">⚠ no extracted text</span>
                      )}
                    </p>
                  </div>
                  <GenerateQuizButton
                    courseId={course.id}
                    materialId={material.id}
                    disabled={!material.hasText}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quizzes */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold">🧪 Practice quizzes</h2>
          {course.quizzes.length === 0 ? (
            <p className="card text-sm text-slate-500">
              No quizzes yet — hit <strong>Generate quiz</strong> on any material with extracted
              text.
            </p>
          ) : (
            <div className="space-y-3">
              {course.quizzes.map((quiz) => (
                <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="card block p-4 transition hover:shadow-lift">
                  <p className="text-sm font-medium">{quiz.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {quiz.isMockExam ? "Mock exam · " : ""}
                    {quiz.attemptCount} attempt{quiz.attemptCount === 1 ? "" : "s"} ·{" "}
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
