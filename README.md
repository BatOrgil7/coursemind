# CourseMind

> **Don't just get the answer. Actually learn it.**

CourseMind is a responsible-AI study platform. The AI is a **Socratic tutor, not an answer
vending machine**: it explains concepts generously, grounds every answer in *your* course's
uploaded materials, and on graded work it guides you with escalating hints instead of handing
over solutions. Web app + native mobile app, one shared API.

| | |
|---|---|
| **Web** | Next.js 15 (App Router) + TypeScript + Tailwind — `apps/web` |
| **Mobile** | Expo SDK 56 + Expo Router + TypeScript — `apps/mobile` |
| **API** | tRPC v11, shared by both apps — `packages/api` |
| **Database** | Prisma + SQLite (dev) / PostgreSQL (prod) — `packages/db` |
| **Shared logic** | Types, validation, AI tutor prompts — `packages/core` |
| **AI** | Anthropic API, model `claude-sonnet-4-6` |

---

## Quick start (5 minutes)

You need **Node.js 18.18+** (you have it if `node --version` works).

```bash
# 1. Install dependencies
npm install

# 2. Create env files (generates a random AUTH_SECRET for you)
npm run setup

# 3. Create + seed the database
npm run db:setup

# 4. Run the web app
npm run dev
```

Open **http://localhost:3000** and log in with the demo account:

| Email | Password | Role |
|---|---|---|
| `alex@demo.edu` | `coursemind` | Student |
| `maya@demo.edu` | `coursemind` | Student |
| `sam@demo.edu` | `coursemind` | TA |

The seed includes a demo university, the CS201 course, two lecture-note materials, and a
ready-made practice quiz — so **the full loop works before you configure anything else**.

## Enabling AI features

The tutor chat, quiz generation, and AI grading need an Anthropic API key:

1. Get a key at https://console.anthropic.com/settings/keys
2. Open `apps/web/.env.local` and set: `ANTHROPIC_API_KEY="sk-ant-..."`
3. Restart the dev server (`Ctrl+C`, then `npm run dev` again)

Without a key the app still runs — AI features show a friendly setup message instead of crashing.

## Running the mobile app

The mobile app is installed separately (it's intentionally **not** part of the npm workspaces —
React Native dependencies break when hoisted):

```bash
cd apps/mobile
npm install
npx expo start
```

Then press `a` for an Android emulator, `i` for an iOS simulator (Mac only), or scan the QR
code with the **Expo Go** app on your phone.

**Important — point the app at your API.** The mobile app needs to reach the web server:

| Where the app runs | API URL to use |
|---|---|
| iOS simulator / web preview | `http://localhost:3000` (the default) |
| Android emulator | `http://10.0.2.2:3000` |
| Physical phone (same Wi-Fi) | `http://YOUR-PC-IP:3000` (find it with `ipconfig`) |

Set it via environment variable when starting:
```bash
# PowerShell example for a physical phone:
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.42:3000"; npx expo start
```

App Store / Play Store shipping steps are in [MOBILE_RELEASE.md](MOBILE_RELEASE.md).

## All commands (run from the repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Start the web app (http://localhost:3000) |
| `npm run setup` | Create env files (safe to re-run; never overwrites) |
| `npm run db:setup` | Generate Prisma client + migrate + seed, all in one |
| `npm run db:migrate` | Create/apply a migration after you change `schema.prisma` |
| `npm run db:seed` | Re-run the seed (safe: it never duplicates) |
| `npm run db:studio` | Open Prisma Studio — browse/edit the database in a GUI |
| `npm run typecheck` | TypeScript check across every workspace |
| `npm run build` | Production build of the web app |

## Project layout

```
coursemind/
├── apps/
│   ├── web/          ← Next.js app (pages, auth, upload endpoint)
│   └── mobile/       ← Expo app (native screens; own node_modules)
├── packages/
│   ├── api/          ← ALL business logic: tRPC routers, AI calls, auth,
│   │                    file text-extraction. Web + mobile both use this.
│   ├── core/         ← Shared types, zod schemas, the tutor prompt system
│   │                    (the tier logic lives in core/src/prompts.ts)
│   └── db/           ← Prisma schema, migrations, seed, client singleton
├── docs/
│   ├── ARCHITECTURE.md         ← how everything fits together
│   ├── TROUBLESHOOTING.md      ← START HERE when something breaks
│   ├── BUSINESS_PLAN.md        ← market, model, go-to-market
│   └── COMPETITOR_RESEARCH.md  ← deep dive on the competitive landscape
├── .env.example      ← documented template for every env var
└── MOBILE_RELEASE.md ← App Store / Play Store shipping guide
```

## How the AI tutor works (the heart)

Defined in `packages/core/src/prompts.ts`, enforced in `packages/api/src/routers/tutor.ts`:

- **Concept questions** (Tier 0): answered fully and generously.
- **Assignment help**: the server computes the maximum hint tier allowed —
  it starts at **Tier 1 (nudge)** and rises one tier per exchange as the student engages,
  capping at **Tier 4 (structured walkthrough)**. The model never hands over a submittable
  answer; the ceiling is enforced server-side, not by trusting the model.
- **Code review**: points at bugs with questions ("what happens when the list is empty?");
  never writes corrected code.
- Every reply is grounded in the course's uploaded materials and **flags clearly** when it
  goes beyond them.
- The tier used is shown as a badge in the UI and recorded on `TutorSession.tierReached`.

## Switching to PostgreSQL (production)

1. In `packages/db/prisma/schema.prisma` change `provider = "sqlite"` → `provider = "postgresql"`
2. Set `DATABASE_URL` (in both `apps/web/.env.local` and `packages/db/.env`) to your Postgres
   connection string, e.g. `postgresql://user:pass@host:5432/coursemind`
3. Run `npm run db:migrate`

That's the only change — the schema was written to be portable.

## Phase status

- ✅ **Phase 1 — Core learning loop** (live): signup with university email, courses,
  shared material library with PDF/DOCX/PPTX text extraction, grounded tiered tutor,
  quiz generation/taking/grading, pre-submit code review, XP + streaks (data layer)
- 🔜 **Phase 2 — Collaboration**: workspaces, task boards, group chat, exam discussion
  boards with AI participation, debug-with-me UI (schema + prompts already in place)
- 🔜 **Phase 3 — Smart studying**: syllabus import, mock exams, spaced repetition,
  weak-spot radar, flashcards, AI study plans (schema already in place)
- 🔜 **Phase 4 — Engagement**: streak/XP UI, leaderboards, upvoting, annotations,
  code sandbox, concept visualizer

Search the codebase for `TODO Phase` to see exactly where each feature hooks in.
