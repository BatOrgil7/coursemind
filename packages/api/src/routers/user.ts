import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { signupUser, verifyCredentials, signMobileToken } from "../auth";

export const userRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email."),
        name: z.string().min(1, "Please enter your name.").max(100),
        password: z.string().min(8, "Password must be at least 8 characters."),
      })
    )
    .mutation(async ({ input }) => {
      const user = await signupUser(input);
      return { id: user.id, email: user.email, name: user.name };
    }),

  // Mobile login: returns a long-lived JWT the Expo app stores securely.
  // (Web login goes through NextAuth instead - see apps/web/auth.ts.)
  mobileLogin: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await verifyCredentials(input.email, input.password);
      if (!user) throw new Error("Invalid email or password.");
      const token = await signMobileToken(user.id);
      return { token, user: { id: user.id, email: user.email, name: user.name } };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      include: { university: true },
    });
    if (!user) throw new Error("User not found.");
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      xp: user.xp,
      streakCount: user.streakCount,
      university: { id: user.university.id, name: user.university.name },
    };
  }),
});
