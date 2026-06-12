// Authenticated app shell: dark sidebar + content area.
// Server component - redirects to /login when there's no session, so every
// page inside (app)/ can assume a logged-in user.
import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { serverApi } from "@/lib/server-api";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", mark: "DB" },
  { href: "/courses", label: "Courses", mark: "CR" },
  { href: "/tutor", label: "AI Tutor", mark: "AI" },
  { href: "/code-review", label: "Code Review", mark: "RV" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const apiCaller = await serverApi();
  const me = await apiCaller.user.me().catch(() => null);
  if (!me) redirect("/login");

  return (
    <div className="min-h-screen lg:flex">
      <aside className="relative z-20 border-b border-white/10 bg-brand-950 px-4 py-4 text-white shadow-lift lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r lg:border-white/10 lg:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(6,182,212,0.18),transparent_36%),linear-gradient(20deg,rgba(163,230,53,0.12),transparent_34%)]" />
        <Link href="/dashboard" className="relative px-2">
          <Logo dark />
        </Link>
        <nav className="relative mt-4 grid grid-cols-2 gap-2 pb-1 sm:flex sm:gap-1 sm:overflow-x-auto lg:mt-8 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rail-link">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-[10px] font-black text-aqua-200 ring-1 ring-white/10">
                {item.mark}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="relative mt-4 grid gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 backdrop-blur sm:grid-cols-[auto_1fr_auto] sm:items-center lg:mt-0 lg:block lg:space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span
              className="inline-flex items-center justify-center rounded-md bg-white/10 px-2 py-1 font-black text-lime-300"
              title="Daily study streak"
            >
              {me.streakCount} day{me.streakCount === 1 ? "" : "s"}
            </span>
            <span
              className="inline-flex items-center justify-center rounded-md bg-white/10 px-2 py-1 font-black text-aqua-200"
              title="Experience points"
            >
              {me.xp} XP
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
            <button className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
