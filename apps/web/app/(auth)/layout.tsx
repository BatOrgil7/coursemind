import Link from "next/link";
import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <div className="card w-full max-w-md">{children}</div>
      <p className="mt-6 max-w-md text-center text-xs text-slate-400">
        Demo account: <span className="font-mono">alex@demo.edu</span> / <span className="font-mono">coursemind</span>
      </p>
    </main>
  );
}
