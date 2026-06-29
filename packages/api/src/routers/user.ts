import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import {
  checkEmailCode,
  isPersonalEmailDomain,
  issueEmailCode,
  prettifyDomain,
  schoolDomainFromEmail,
  signupUser,
  verifyCredentials,
  signMobileToken,
} from "../auth";
import { isEmailConfigured, sendVerificationEmail } from "../email";

// "Are we on the real hosted site?" Vercel sets this on every deployment.
// Used to keep the dev convenience (returning the code) OUT of production.
const IS_HOSTED = Boolean(process.env.VERCEL);

export const userRouter = router({
  schoolPreview: publicProcedure
    .input(z.object({ email: z.string().max(200) }))
    .query(async ({ ctx, input }) => {
      const domain = schoolDomainFromEmail(input.email);
      if (!domain) {
        return {
          status: "invalid" as const,
          domain: null,
          schoolName: null,
          known: false,
          courseCount: 0,
          resourceCount: 0,
          message: "Enter your school email to unlock your campus course graph.",
        };
      }

      if (isPersonalEmailDomain(domain)) {
        return {
          status: "personal_email" as const,
          domain,
          schoolName: null,
          known: false,
          courseCount: 0,
          resourceCount: 0,
          message: "Personal email - you'll get your own private study space. Use a school email to join your campus and classmates.",
        };
      }

      const university = await ctx.prisma.university.findUnique({
        where: { emailDomain: domain },
        select: { id: true, name: true },
      });

      if (!university) {
        return {
          status: "new_school" as const,
          domain,
          schoolName: prettifyDomain(domain),
          known: false,
          courseCount: 0,
          resourceCount: 0,
          message: "New school space detected. Hyntor will create it when you sign up.",
        };
      }

      const courses = await ctx.prisma.course.findMany({
        where: { enrollments: { some: { user: { universityId: university.id } } } },
        select: { id: true, _count: { select: { materials: true } } },
      });

      return {
        status: "recognized" as const,
        domain,
        schoolName: university.name,
        known: true,
        courseCount: courses.length,
        resourceCount: courses.reduce((sum, course) => sum + course._count.materials, 0),
        message: "School recognized. We will show related courses and materials after signup.",
      };
    }),

  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email."),
        name: z.string().min(1, "Please enter your name.").max(100),
        password: z.string().min(8, "Password must be at least 8 characters."),
      })
    )
    .mutation(async ({ input }) => {
      // On the hosted site we must be able to actually deliver the code. If no
      // email provider is configured, block email/password signup (steer to
      // Google) rather than create an account that can never be verified - and
      // never leak the code to the client in production.
      if (IS_HOSTED && !isEmailConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: 'Email sign-up isn\'t available yet - please use "Continue with Google" for now.',
        });
      }
      // Create (or re-fetch an unverified) account, then email a code. The
      // user must verify before they can log in.
      const user = await signupUser(input);
      const code = await issueEmailCode(user.id);
      const { delivered } = await sendVerificationEmail(user.email, code);
      // Dev-only convenience: when there's no email provider AND we're not on
      // the hosted site, return the code so the flow stays testable locally.
      const devCode = delivered || IS_HOSTED ? null : code;
      return { email: user.email, emailSent: delivered, devCode };
    }),

  /** Confirm the 6-digit code emailed at signup. */
  verifyEmail: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().min(4).max(12) }))
    .mutation(async ({ input }) => {
      const ok = await checkEmailCode(input.email, input.code);
      if (!ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That code is incorrect or has expired. Request a new one and try again.",
        });
      }
      return { ok: true };
    }),

  /** Email a fresh code to an unverified account. */
  resendCode: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const normalized = input.email.toLowerCase().trim();
      const user = await ctx.prisma.user.findUnique({ where: { email: normalized } });
      // Don't reveal whether the account exists or is already verified.
      if (!user || user.emailVerified) return { email: normalized, emailSent: false, devCode: null };
      const code = await issueEmailCode(user.id);
      const { delivered } = await sendVerificationEmail(normalized, code);
      const devCode = delivered || IS_HOSTED ? null : code;
      return { email: normalized, emailSent: delivered, devCode };
    }),

  // Mobile login: returns a long-lived JWT the Expo app stores securely.
  // (Web login goes through NextAuth instead - see apps/web/auth.ts.)
  mobileLogin: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await verifyCredentials(input.email, input.password);
      if (!user) throw new Error("Invalid email or password.");
      if (user.pendingCodeHash) {
        throw new Error("Please verify your email first - check your inbox for the code.");
      }
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
      university: { id: user.university.id, name: user.university.name, emailDomain: user.university.emailDomain },
    };
  }),

  /** Full profile payload for the /profile page: account + activity stats. */
  profile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.userId },
      include: {
        university: true,
        _count: {
          select: { enrollments: true, materials: true, quizAttempts: true, tutorSessions: true },
        },
      },
    });
    // Personal/free-mail users live in an isolated space keyed "personal:<email>".
    const isPersonalSpace = user.university.emailDomain.startsWith("personal:");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      streakCount: user.streakCount,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified !== null,
      signInMethod: user.passwordHash.startsWith("oauth:") ? ("google" as const) : ("password" as const),
      space: {
        name: isPersonalSpace ? "Personal study space" : user.university.name,
        isPersonalSpace,
      },
      stats: {
        courses: user._count.enrollments,
        materialsShared: user._count.materials,
        quizzesTaken: user._count.quizAttempts,
        tutorSessions: user._count.tutorSessions,
      },
    };
  }),

  /** Update the current user's display name. */
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().min(1, "Please enter your name.").max(100) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { name: input.name.trim() },
        select: { id: true, name: true },
      });
      return user;
    }),

  schoolHub: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.userId },
      include: { university: true },
    });

    const myEnrollments = await ctx.prisma.enrollment.findMany({
      where: { userId: ctx.userId },
      select: { courseId: true },
    });
    const joined = new Set(myEnrollments.map((enrollment) => enrollment.courseId));

    const [schoolCourses, topResources, peerCount, resourceCount] = await Promise.all([
      ctx.prisma.course.findMany({
        where: { enrollments: { some: { user: { universityId: user.universityId } } } },
        include: { _count: { select: { enrollments: true, materials: true, quizzes: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      ctx.prisma.material.findMany({
        where: { course: { enrollments: { some: { user: { universityId: user.universityId } } } } },
        include: {
          course: { select: { id: true, code: true, title: true } },
          uploader: { select: { name: true } },
        },
        orderBy: [{ upvoteCount: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
      ctx.prisma.user.count({ where: { universityId: user.universityId } }),
      ctx.prisma.material.count({
        where: { course: { enrollments: { some: { user: { universityId: user.universityId } } } } },
      }),
    ]);

    return {
      university: {
        id: user.university.id,
        name: user.university.name,
        emailDomain: user.university.emailDomain,
      },
      stats: {
        peerCount,
        courseCount: schoolCourses.length,
        resourceCount,
      },
      courses: schoolCourses.map((course) => ({
        id: course.id,
        code: course.code,
        title: course.title,
        subject: course.subject,
        description: course.description,
        joined: joined.has(course.id),
        memberCount: course._count.enrollments,
        materialCount: course._count.materials,
        quizCount: course._count.quizzes,
      })),
      resources: topResources.map((material) => ({
        id: material.id,
        title: material.title,
        type: material.type,
        upvoteCount: material.upvoteCount,
        uploaderName: material.uploader.name,
        createdAt: material.createdAt,
        course: material.course,
      })),
    };
  }),
});
