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
    <div className="min-h-screen lg:flex">
      <aside className="bg-brand-950 px-4 py-4 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col lg:py-6">
        <Link href="/dashboard" className="px-2">
          <Logo dark />
        </Link>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-brand-900 hover:text-white lg:gap-3"
            >
              <span>{item.emoji}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 grid gap-3 border-t border-brand-900 pt-4 sm:grid-cols-[auto_1fr_auto] sm:items-center lg:mt-0 lg:block lg:space-y-3">
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
            className="sm:justify-self-end lg:block"
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
      <main className="flex-1 px-4 py-6 sm:px-6 lg:ml-60 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
