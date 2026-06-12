// The app router — the single API surface consumed by web AND mobile.
// TODO Phase 3: studyPlanRouter, flashcardRouter, mockExam procedures
// TODO Phase 4: leaderboard, material upvotes, annotations
import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { courseRouter } from "./routers/course";
import { materialRouter } from "./routers/material";
import { tutorRouter } from "./routers/tutor";
import { quizRouter } from "./routers/quiz";
import { workspaceRouter } from "./routers/workspace";
import { discussionRouter } from "./routers/discussion";

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  material: materialRouter,
  tutor: tutorRouter,
  quiz: quizRouter,
  workspace: workspaceRouter,
  discussion: discussionRouter,
});

export type AppRouter = typeof appRouter;
