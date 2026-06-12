// Small shared UI atoms. Kept deliberately simple — plain Tailwind,
// no component library — so every piece is easy to read and restyle.
import Link from "next/link";
import { TIER_LABELS } from "@coursemind/core";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
      Course<span className="text-brand-500">Mind</span>
    </span>
  );
}

const TIER_STYLES: Record<number, string> = {
  0: "bg-emerald-100 text-emerald-800",
  1: "bg-sky-100 text-sky-800",
  2: "bg-violet-100 text-violet-800",
  3: "bg-amber-100 text-amber-800",
  4: "bg-rose-100 text-rose-800",
};

/** Shows which hint tier an AI reply used — the visible face of the tier system. */
export function TierBadge({ tier }: { tier: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIER_STYLES[tier] ?? TIER_STYLES[0]}`}
      title="CourseMind escalates hints only as you engage — that's how you actually learn."
    >
      Tier {tier} · {TIER_LABELS[tier] ?? "Hint"}
    </span>
  );
}

export const MODE_META: Record<string, { label: string; emoji: string; blurb: string }> = {
  CONCEPT: {
    label: "Learn a concept",
    emoji: "💡",
    blurb: "Full, generous explanations of anything in your course.",
  },
  ASSIGNMENT_HELP: {
    label: "Assignment help",
    emoji: "🧭",
    blurb: "Tiered hints that guide you to YOUR answer — never hand it over.",
  },
  CODE_REVIEW: {
    label: "Code review",
    emoji: "🔍",
    blurb: "Paste homework code before submitting — get pointed questions, not rewrites.",
  },
  DEBUG: {
    label: "Debug with me",
    emoji: "🐛",
    blurb: "Step-by-step Socratic debugging of your code.",
  },
};

export function ModeBadge({ mode }: { mode: string }) {
  const meta = MODE_META[mode];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
      {meta?.emoji} {meta?.label ?? mode}
    </span>
  );
}

export const WORKSPACE_TYPE_META: Record<string, { label: string; emoji: string }> = {
  STUDY_GROUP: { label: "Study group", emoji: "👥" },
  PROJECT: { label: "Project", emoji: "🛠️" },
};

export function WorkspaceTypeBadge({ type }: { type: string }) {
  const meta = WORKSPACE_TYPE_META[type] ?? { label: type, emoji: "👥" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
      {meta.emoji} {meta.label}
    </span>
  );
}

export const CONTEXT_TYPE_META: Record<string, { label: string; emoji: string }> = {
  COURSE: { label: "Course", emoji: "📚" },
  QUIZ: { label: "Quiz", emoji: "🧪" },
  MATERIAL: { label: "Material", emoji: "📄" },
  EXAM: { label: "Exam", emoji: "📝" },
};

/** Which part of the course a discussion thread is about (EXAM threads get amber). */
export function ContextTypeBadge({ type }: { type: string }) {
  const meta = CONTEXT_TYPE_META[type] ?? { label: type, emoji: "💬" };
  const style = type === "EXAM" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}>
      {meta.emoji} {meta.label}
    </span>
  );
}

/** Marks a course shared beyond a single university (Phase 2). */
export function CrossUniversityBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800"
      title="Open to students from every university"
    >
      🌍 Cross-university
    </span>
  );
}

export function MaterialTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-600">
      {type}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <p className="font-display text-lg font-semibold text-slate-700">{title}</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">{body}</p>
      {cta && href && (
        <Link href={href} className="btn-primary mt-5">
          {cta}
        </Link>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
