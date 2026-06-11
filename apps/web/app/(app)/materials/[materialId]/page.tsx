import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import { MaterialTypeBadge, PageHeader } from "@/components/ui";
import { GenerateQuizButton } from "@/components/GenerateQuizButton";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;
  const api = await serverApi();
  const material = await api.material.get({ materialId });

  return (
    <div>
      <PageHeader
        title={material.title}
        subtitle={`${material.course.code} · uploaded by ${material.uploaderName} · ${new Date(material.createdAt).toLocaleDateString()}`}
        action={
          <div className="flex items-center gap-3">
            <Link href={`/tutor?courseId=${material.course.id}`} className="btn-secondary">
              🧠 Ask about this
            </Link>
            <GenerateQuizButton
              courseId={material.course.id}
              materialId={material.id}
              disabled={!material.extractedText}
            />
          </div>
        }
      />
      <p className="mb-4">
        <MaterialTypeBadge type={material.type} />
        <Link href={`/courses/${material.course.id}`} className="ml-3 text-sm text-brand-600 hover:underline">
          ← Back to {material.course.code}
        </Link>
      </p>

      <div className="card">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Extracted text (what the AI tutor reads)
        </h2>
        {material.extractedText ? (
          <pre className="max-h-[36rem] overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
            {material.extractedText}
          </pre>
        ) : (
          <p className="text-sm text-amber-700">
            ⚠ No text could be extracted from this material, so the AI tutor can&apos;t use it. If
            it&apos;s a scanned PDF, try an OCR&apos;d version — or paste the content as text from
            the course&apos;s upload page.
          </p>
        )}
      </div>
    </div>
  );
}
