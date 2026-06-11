"use client";

// Material upload: file (PDF/DOCX/PPTX/TXT/MD → server-side text extraction)
// or paste text directly. Both land in the shared course library.
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/trpc";
import { PageHeader } from "@/components/ui";

export default function UploadPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState<"file" | "text">("file");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [type, setType] = useState("NOTES");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("courseId", courseId);
      form.append("title", title);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      if (data.warning) {
        // Stored, but extraction had problems — tell the student honestly.
        setWarning(data.warning);
        setBusy(false);
      } else {
        router.push(`/courses/${courseId}`);
        router.refresh();
      }
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function handleTextUpload(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.material.createFromText.mutate({
        courseId,
        title,
        text,
        type: type as "NOTES" | "SYLLABUS" | "TEXT",
      });
      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (warning) {
    return (
      <div>
        <PageHeader title="Uploaded — with a catch" />
        <div className="card max-w-2xl">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠ {warning}</p>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={() => router.push(`/courses/${courseId}`)}>
              Back to course
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setWarning(null);
                setTab("text");
              }}
            >
              Paste the text instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Upload course material"
        subtitle="PDF, PPTX, DOCX, TXT, or MD — the text is extracted so the AI tutor can ground its answers in it. Shared with everyone in the course."
      />
      <div className="card max-w-2xl">
        <div className="mb-6 flex gap-2">
          <button
            className={tab === "file" ? "btn-primary" : "btn-secondary"}
            onClick={() => setTab("file")}
          >
            📄 Upload a file
          </button>
          <button
            className={tab === "text" ? "btn-primary" : "btn-secondary"}
            onClick={() => setTab("text")}
          >
            ✍️ Paste text
          </button>
        </div>

        {tab === "file" ? (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="label">Title (optional — defaults to the file name)</label>
              <input
                className="input"
                placeholder="Lecture 12 — Graph Traversal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">File (max 25 MB)</label>
              <input
                type="file"
                required
                accept=".pdf,.docx,.pptx,.txt,.md"
                className="input"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button type="submit" disabled={busy || !file} className="btn-primary">
              {busy ? "Uploading & extracting text…" : "Upload to shared library"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTextUpload} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                required
                placeholder="My week 5 notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="NOTES">Notes</option>
                <option value="SYLLABUS">Syllabus</option>
                <option value="TEXT">Other text</option>
              </select>
            </div>
            <div>
              <label className="label">Content</label>
              <textarea
                className="input font-mono text-xs"
                rows={12}
                required
                placeholder="Paste your notes, syllabus, or any study text here…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Saving…" : "Add to shared library"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
