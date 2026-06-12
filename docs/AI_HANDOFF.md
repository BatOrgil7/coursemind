# AI Handoff

This file is the shared working log for Codex, Claude Code, and the user. Read it before starting work and update it after meaningful changes.

## Project Summary

Project name in transition: Hyntor, formerly CourseMind.

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
