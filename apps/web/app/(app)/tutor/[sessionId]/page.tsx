"use client";

// The tutor chat. Every assistant reply shows its tier badge, making the
// "hints, not handouts" mechanic visible — students see themselves earning
// deeper help by engaging.
import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/trpc";
import { Markdown } from "@/components/Markdown";
import { ModeBadge, TierBadge } from "@/components/ui";
import type { TutorMessage } from "@coursemind/core";

type SessionPayload = Awaited<ReturnType<typeof api.tutor.getSession.query>>;

const MODE_PLACEHOLDERS: Record<string, string> = {
  CONCEPT: "Ask anything — e.g. “Why does quicksort degrade to O(n²)?”",
  ASSIGNMENT_HELP: "Describe the assignment problem you're stuck on…",
  CODE_REVIEW: "Paste your code (with a note about what it should do)…",
  DEBUG: "Paste the broken code + the error or wrong behavior you're seeing…",
};

export default function TutorSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.tutor.getSession.query({ sessionId });
        setSession(data);
        setMessages(data.messages);
        if (!data.aiConfigured) {
          setNotice(
            "Heads up: no Anthropic API key is configured yet, so the tutor can't reply. See README.md → 'Enabling AI features'."
          );
        }
      } catch (err) {
        setError(errorMessage(err));
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const content = input.trim();
    if (!content || busy) return;
    setBusy(true);
    setError(null);
    const now = new Date().toISOString();
    setMessages((prev) => [...prev, { role: "user", content, createdAt: now }]);
    setInput("");
    try {
      const reply = await api.tutor.sendMessage.mutate({ sessionId, content });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply.content,
          tier: reply.tier ?? undefined,
          createdAt: new Date().toISOString(),
        },
      ]);
      if (!reply.aiConfigured) {
        // Not persisted server-side; remove the optimistic user message too.
        setNotice("The tutor needs an ANTHROPIC_API_KEY to reply — see README.md.");
      }
    } catch (err) {
      setError(errorMessage(err));
      // Put the unsent text back so the student doesn't lose it.
      setInput(content);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  if (!session && !error) {
    return <p className="py-12 text-center text-sm text-slate-400">Loading session…</p>;
  }
  if (error && !session) {
    return <p className="py-12 text-center text-sm text-rose-600">{error}</p>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link href="/tutor" className="text-xs text-brand-600 hover:underline">
            ← All sessions
          </Link>
          <h1 className="truncate font-display text-lg font-bold">{session!.title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ModeBadge mode={session!.mode} />
          {session!.course && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              📚 {session!.course.code}
            </span>
          )}
        </div>
      </div>

      {notice && (
        <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">⚠ {notice}</p>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
        {messages.length === 0 && (
          <div className="card mx-auto mt-8 max-w-lg text-center">
            <p className="text-3xl">🧠</p>
            <p className="mt-2 font-display font-semibold">
              {session!.mode === "ASSIGNMENT_HELP"
                ? "Stuck on an assignment? Good — that's where learning happens."
                : "What do you want to understand?"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {session!.mode === "ASSIGNMENT_HELP"
                ? "I'll guide you with hints that go deeper as you engage — the final answer will be yours, and you'll actually own it."
                : MODE_PLACEHOLDERS[session!.mode]}
            </p>
          </div>
        )}
        {messages.map((message, i) =>
          message.role === "user" ? (
            <div key={i} className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-[15px] text-white">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ) : (
            <div key={i} className="max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-card">
              {typeof message.tier === "number" && (
                <div className="mb-2">
                  <TierBadge tier={message.tier} />
                </div>
              )}
              <Markdown>{message.content}</Markdown>
            </div>
          )
        )}
        {busy && (
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-card">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && session && (
        <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      {/* Composer */}
      <div className="flex items-end gap-3 border-t border-slate-200 pt-4">
        <textarea
          className="input min-h-[3rem] flex-1 resize-y"
          rows={2}
          placeholder={MODE_PLACEHOLDERS[session!.mode]}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button onClick={send} disabled={busy || !input.trim()} className="btn-primary">
          Send
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
