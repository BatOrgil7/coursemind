// The app router — the single API surface consumed by web AND mobile.
// TODO Phase 2: workspaceRouter (study groups, task boards, chat),
//               discussionRouter (threads with AI tutor participation)
// TODO Phase 3: studyPlanRouter, flashcardRouter, mockExam procedures
// TODO Phase 4: leaderboard, material upvotes, annotations
import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { courseRouter } from "./routers/course";
import { materialRouter } from "./routers/material";
import { tutorRouter } from "./routers/tutor";
import { quizRouter } from "./routers/quiz";

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  material: materialRouter,
  tutor: tutorRouter,
  quiz: quizRouter,
});

export type AppRouter = typeof appRouter;
