// Authenticated app shell: dark sidebar + content area.
// Server component — redirects to /login when there's no session, so every
// page inside (app)/ can assume a logged-in user.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { serverApi } from "@/lib/server-api";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/courses", label: "Courses", emoji: "📚" },
  { href: "/tutor", label: "AI Tutor", emoji: "🧠" },
  { href: "/code-review", label: "Code Review", emoji: "🔍" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const apiCaller = await serverApi();
  const me = await apiCaller.user.me().catch(() => null);
  if (!me) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-brand-950 px-4 py-6 text-white">
        <Link href="/dashboard" className="px-2">
          <Logo dark />
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-brand-900 hover:text-white"
            >
              <span>{item.emoji}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 border-t border-brand-900 pt-4">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-ember-400" title="Daily study streak">
              🔥 {me.streakCount} day{me.streakCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-brand-300" title="Experience points">
              ⚡ {me.xp} XP
            </span>
          </div>
          <div className="px-2">
            <p className="truncate text-sm font-semibold">{me.name}</p>
            <p className="truncate text-xs text-slate-400">{me.university.name}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="w-full rounded-xl border border-brand-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-brand-900 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="ml-60 flex-1 px-8 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
