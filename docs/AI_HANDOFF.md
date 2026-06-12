# AI Handoff

This file is the shared working log for Codex, Claude Code, and the user. Read it before starting work and update it after meaningful changes.

## Project Summary

Project name: Hyntor, formerly CourseMind.

Hyntor is a student-first class study platform. Students join courses and share class materials that matter for studying: lecture notes, slides, homework prompts, tests, practice exams, discussion context, and other course files. The AI uses that class-specific context to help students understand the class and prepare effectively.

The product should not be framed only as "grounded tutoring from uploaded notes." The stronger framing is: shared course context plus AI help, with the class library making the app smarter and more useful for everyone in the course.

The core promise remains learning-first AI:
- Explain concepts generously.
- Use the course's shared context whenever available.
- For graded or likely-graded work, guide with hints rather than final submittable answers.
- Keep the hint-tier system visible as a product differentiator.

## Current Architecture

- `apps/web`: Next.js App Router web app.
- `apps/mobile`: Expo mobile app.
- `packages/api`: tRPC API and business logic.
- `packages/core`: shared types, constants, prompts, AI behavior.
- `packages/db`: Prisma schema, migrations, seed data.

## Coordination Protocol

Before work:
- Run `git status --short`.
- Read this file.
- Check whether another agent has uncommitted changes in the files you plan to touch.

During work:
- Keep edits scoped.
- Do not revert user or other-agent work.
- If the same file is being edited by another agent, either coordinate or make a smaller change elsewhere.

After work:
- Add a dated entry below with summary, files touched, checks run, and next steps.

## Work Log

### 2026-06-12 - Codex - Shared Context Setup

Summary:
- Added shared project context for Codex and Claude Code.
- Captured the corrected product framing: students share class materials, homework prompts, tests/practice exams, and course context so the AI can help with that class.
- Preserved the learning-first and hint-tier positioning already present in the product.

Files touched:
- `AGENTS.md`
- `CLAUDE.md`
- `docs/AI_HANDOFF.md`

Checks run:
- `git status --short`
- Confirmed `AGENTS.md`, `CLAUDE.md`, and `docs/AI_HANDOFF.md` did not exist before setup.

Notes:
- Existing uncommitted changes were already present before this setup:
  - `packages/core/src/prompts.ts`
  - `packages/core/src/sm2.ts`
  - `packages/core/src/studyplan.ts`
  - `.claude/`
- These were not modified by Codex during this setup.

Next steps:
- In Claude Code, ask Claude to read `CLAUDE.md` and `docs/AI_HANDOFF.md`.
- In future Codex sessions, Codex should automatically load `AGENTS.md`; for this live session, explicitly ask Codex to read `AGENTS.md` and this handoff if needed.
- Decide whether to run a full CourseMind-to-Hyntor rename pass across app UI, docs, packages, and metadata.

### 2026-06-12 - Codex - Phase 3 Smart Study Web/API

Summary:
- Continued from Claude's Phase 3 core helper work and completed a working web/API vertical slice.
- Added course Smart Study hub with exam study plans, weak-topic radar, flashcard generation/review, and mock exam generation.
- Added no-key fallback behavior for study plans and flashcards; mock exams still require `ANTHROPIC_API_KEY`.
- Fixed the authenticated app shell so course tools are usable on mobile web instead of being clipped by the desktop sidebar.
- Added `docs/PHASE3_SMART_STUDY.md` as the implementation note.

Files touched:
- `apps/web/app/(app)/courses/[courseId]/study/page.tsx`
- `apps/web/app/(app)/courses/[courseId]/page.tsx`
- `apps/web/app/(app)/layout.tsx`
- `packages/api/src/root.ts`
- `packages/api/src/routers/study.ts`
- `packages/api/src/routers/flashcard.ts`
- `packages/api/src/routers/quiz.ts`
- `packages/core/src/index.ts`
- `packages/core/src/types.ts`
- `packages/core/src/prompts.ts`
- `packages/core/src/sm2.ts`
- `packages/core/src/studyplan.ts`
- `docs/PHASE3_SMART_STUDY.md`
- `docs/AI_HANDOFF.md`

Checks run:
- `npm run typecheck --workspace packages/api`
- `npm run typecheck --workspace packages/core`
- `npm run typecheck --workspace apps/web`
- `npm run typecheck`
- `npm run build`
- In-app browser QA on login, CS201 course page, and `/courses/cmq8qy9t00007oetsgyv8u3nh/study`.

Browser QA notes:
- Demo login with `alex@demo.edu / coursemind` succeeded.
- Course page showed the new Smart Study link.
- Study plan creation for `2026-06-20` succeeded and rendered a schedule.
- Marking the first plan day complete persisted.
- Flashcard generation created review cards without an API key.
- Revealing and rating a flashcard updated the queue from 9 due to 8 due.
- Mock exam generation showed the friendly no-key setup message because no `ANTHROPIC_API_KEY` is configured.
- Desktop and mobile viewport checks showed no console errors after the responsive shell fix.

Notes:
- The local dev database now contains QA/demo data from Phase 2 and Phase 3 verification, including a CS201 study plan and flashcards for Alex. Run `npm run db:setup` to reset demo data.
- The mobile native app does not yet have Phase 3 screens.
- Existing docs and UI still mostly use the CourseMind name. Hyntor remains the preferred new brand, but no full rename pass has been run.

Next steps:
- Add native mobile screens for the Smart Study hub.
- Add syllabus-import UX beyond using uploaded `SYLLABUS` materials.
- Add a real weak-spot chart visualization if the product wants richer analytics.
- Run the full CourseMind-to-Hyntor rename pass when the user confirms.

### 2026-06-12 - Codex - Web Visual Redesign

Summary:
- Reworked the web visual system around a more modern student-facing palette, glass surfaces, sharper 8px cards, stronger typography, and consistent command/button treatment.
- Updated the authenticated shell, dashboard, tutor hub, tutor chat, courses, course detail, smart study, upload, materials, discussions, workspaces, quizzes, auth screens, and public landing page.
- Removed old emoji/encoding artifacts from the touched UI and replaced mode/context markers with short structured badges.
- Kept behavior and data contracts unchanged.

Files touched:
- `apps/web/tailwind.config.ts`
- `apps/web/app/globals.css`
- `apps/web/components/ui.tsx`
- `apps/web/components/GenerateQuizButton.tsx`
- Most `apps/web/app` web pages and two API route comments touched for encoding cleanup.
- `docs/AI_HANDOFF.md`

Checks run:
- `npm run typecheck --workspace apps/web`
- `npm run typecheck`
- `git diff --check`
- In-app browser QA at desktop and mobile viewports on `/tutor`, `/dashboard`, `/courses`, `/code-review`, and a course Smart Study route.

Browser QA notes:
- Demo login with `alex@demo.edu / coursemind` succeeded.
- `/tutor` rendered the new session cards and past-session surface with no horizontal overflow.
- Mobile app shell now uses a two-column nav grid instead of a horizontal scrollbar.
- Dashboard, Courses, Code Review, and Smart Study rendered with no console errors, no old mojibake artifacts, and no horizontal overflow.

Next steps:
- Run the production build after this entry.
- Continue using Hyntor in UI until the user explicitly confirms a full rename pass.

### 2026-06-12 - Codex - Hyntor Rename and iOS-Inspired Redesign

Summary:
- Renamed the product-facing brand to Hyntor across web UI, mobile metadata, docs, seed logs, and AI prompt persona.
- Reworked the web visual system toward an iOS-inspired interface: system/SF-style font stack, white/translucent surfaces, Apple-like blue accent, quieter shadows, flatter rounded controls, and a light app shell.
- Updated the landing, auth screens, authenticated shell, dashboard, tutor hub, and shared UI primitives for consistent Hyntor branding.
- Cleaned encoding fallout from the earlier broad rename pass and normalized touched docs/prompts to ASCII.
- Kept internal workspace package scopes as `@coursemind/*` to avoid a risky package namespace migration in the same change.

Files touched:
- `apps/web/tailwind.config.ts`
- `apps/web/app/globals.css`
- `apps/web/components/ui.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/(app)/layout.tsx`
- Main web app pages under `apps/web/app/(app)`
- `apps/web/app/(auth)/layout.tsx`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/signup/page.tsx`
- `apps/mobile/app.json`
- `packages/core/src/prompts.ts`
- `packages/api/src/auth.ts`
- `packages/api/src/routers/discussion.ts`
- `packages/db/prisma/seed.ts`
- Project docs and metadata

Checks run:
- `npm run typecheck`
- `git diff --check`
- `npm run build`
- In-app browser QA on `/tutor`, `/dashboard`, and `/login` at desktop and iPhone-width viewports.

Browser QA notes:
- `/tutor` loaded as Alex with no console errors.
- Desktop viewport `1440x900` and mobile viewport `390x844` had no horizontal overflow.
- Dashboard and login pages rendered with Hyntor branding, system font stack, light surfaces, and no console errors.

Next steps:
- If the package namespace ever needs to match the product name, migrate `@coursemind/*` imports in a dedicated change.

### 2026-06-12 - Codex - Dashboard Smart Study Overview

Summary:
- Added a dashboard-level Smart Study overview API that summarizes each enrolled course's due flashcards, weak topics, active study plan progress, and next plan day.
- Updated the dashboard to show a Smart Study priority section immediately after the daily hero.
- Added course-level priority cards with review queue counts, material/quiz counts, next study-plan date, progress bar, weak-topic chips, and direct links into each course's Smart Study hub.

Files touched:
- `packages/api/src/routers/study.ts`
- `apps/web/app/(app)/dashboard/page.tsx`
- `docs/AI_HANDOFF.md`

Checks run:
- `npm run typecheck`
- `git diff --check`
- `npm run build`
- In-app browser QA on `/dashboard` at default, `1440x900`, and `390x844` viewports.

Browser QA notes:
- Dashboard rendered the new Smart Study section for Alex.
- Desktop and iPhone-width checks had no horizontal overflow.
- No console errors were reported.

Next steps:
- Add a dedicated weak-topic visualization inside the course Smart Study page if richer analytics are needed.
- Bring Smart Study surfaces into the native mobile app.

### 2026-06-12 - Codex - Course Smart Study Analytics

Summary:
- Upgraded the course Smart Study page with a readiness panel showing study-plan progress, next study block, review queue pressure, and weak-topic misses.
- Reworked the weak spots panel into a weak-topic radar with ranked severity bars, a focused tutor link, and a recommended next move.
- Added accessible progressbar labels and values for the new visual progress indicators.

Files touched:
- `apps/web/app/(app)/courses/[courseId]/study/page.tsx`
- `docs/AI_HANDOFF.md`

Checks run:
- `npm run typecheck`
- `git diff --check`
- `npm run build`
- In-app browser QA on the CS201 Smart Study route at default and `390x844` viewports.

Browser QA notes:
- Smart Study page rendered the new Course pulse and Weak topic radar panels after client data load.
- Desktop/default and iPhone-width checks had no horizontal overflow.
- No console errors were reported.

Next steps:
- Bring Smart Study surfaces into the native mobile app.
- Consider adding click-through weak-topic filters for quiz generation later.

### 2026-06-12 - Codex - Native Mobile Smart Study

Summary:
- Added a native Expo Smart Study screen at `/study/[courseId]` backed by the existing `study.courseDashboard` API.
- Added a Smart Study entry card on the native course detail screen.
- Updated native mobile theme tokens to match the Hyntor/iOS-inspired web palette.
- Cleaned corrupted mobile UI glyphs in course list, course detail, tutor hub, profile, quiz, and tutor chat screens.
- Replaced mobile tab emoji icons with compact text marks for reliable rendering.

Files touched:
- `apps/mobile/src/app/study/[courseId].tsx`
- `apps/mobile/src/app/course/[id].tsx`
- `apps/mobile/src/app/(tabs)/_layout.tsx`
- `apps/mobile/src/app/(tabs)/courses.tsx`
- `apps/mobile/src/app/(tabs)/tutor.tsx`
- `apps/mobile/src/app/(tabs)/profile.tsx`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/login.tsx`
- `apps/mobile/src/app/session/[id].tsx`
- `apps/mobile/src/app/quiz/[id].tsx`
- `apps/mobile/src/lib/theme.ts`
- `docs/PHASE3_SMART_STUDY.md`
- `docs/AI_HANDOFF.md`

Checks run:
- `npm run typecheck`
- `npx tsc --noEmit` from `apps/mobile`
- `npm run build`
- `git diff --check`
- `npx expo config --type public`
- Mobile source scan for non-ASCII/corrupted glyphs in `apps/mobile/src`, `apps/mobile/app.json`, and `apps/mobile/README.md`.

Notes:
- This native Smart Study screen is read-only for now: course pulse, weak-topic radar, latest schedule, and flashcard stats.
- Web remains the place to create plans, generate flashcards, and run mock exams.

Next steps:
- Add native mobile actions for study-plan creation and flashcard review.
- Consider click-through weak-topic filters for quiz generation later.

### 2026-06-12 - Codex - Syllabus Autopilot

Summary:
- Added `study.importSyllabus` to save pasted syllabi as `SYLLABUS` materials, extract dated milestones, and generate deadline-aware study plans.
- Added deterministic syllabus parsing and workback schedule helpers in `packages/core/src/syllabus.ts`.
- Added an AI prompt for structured syllabus milestone extraction; Anthropic is used when configured, with deterministic fallback otherwise.
- Updated the course Smart Study page with a Syllabus Autopilot panel, post-scan summary, deadline rows in the study plan, and an upcoming syllabus timeline.
- Connected the existing pasted-text upload flow so choosing type `SYLLABUS` builds the Smart Study plan and redirects to the course Smart Study page.

Files touched:
- `packages/core/src/constants.ts`
- `packages/core/src/types.ts`
- `packages/core/src/prompts.ts`
- `packages/core/src/studyplan.ts`
- `packages/core/src/syllabus.ts`
- `packages/core/src/index.ts`
- `packages/api/src/routers/study.ts`
- `apps/web/app/(app)/courses/[courseId]/study/page.tsx`
- `apps/web/app/(app)/courses/[courseId]/upload/page.tsx`
- `docs/PHASE3_SMART_STUDY.md`
- `docs/AI_HANDOFF.md`

Checks run so far:
- `npm run typecheck`
- `npx tsc --noEmit` from `apps/mobile`
- `git diff --check`
- `npm run build`
- In-process `study.importSyllabus` QA with `ANTHROPIC_API_KEY` blank: 6 milestones, 19 schedule rows, plan created.
- In-app browser QA on `/courses/cmq8qy9t00007oetsgyv8u3nh/study` at `1440x900` and `390x844`: Syllabus Autopilot visible, timeline visible, no horizontal overflow, no console errors.

Notes:
- No database migration was needed. Syllabus deadlines are encoded in `StudyPlan.schedule` with optional `kind`, `source`, and `milestoneType` fields.
- Existing schedules remain compatible because `StudyPlanDaySchema` defaults missing `kind` to `study`.

Next steps:
- Add native mobile syllabus import and timeline display.
- Consider calendar export or notification reminders for syllabus deadlines.
