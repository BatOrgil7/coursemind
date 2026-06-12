import { z } from "zod";
import { MATERIAL_TYPES } from "@coursemind/core";
import { router, protectedProcedure, requireEnrollment } from "../trpc";
import { recordActivity } from "../activity";
import { prisma } from "@coursemind/db";
import { extractTextFromFile } from "../extract";

export const materialRouter = router({
  get: protectedProcedure
    .input(z.object({ materialId: z.string() }))
    .query(async ({ ctx, input }) => {
      const material = await ctx.prisma.material.findUniqueOrThrow({
        where: { id: input.materialId },
        include: { uploader: { select: { name: true } }, course: { select: { id: true, code: true, title: true } } },
      });
      await requireEnrollment(ctx.userId, material.courseId);
      return {
        id: material.id,
        title: material.title,
        type: material.type,
        fileUrl: material.fileUrl,
        extractedText: material.extractedText,
        upvoteCount: material.upvoteCount,
        uploaderName: material.uploader.name,
        course: material.course,
        createdAt: material.createdAt,
      };
    }),

  /** Paste-in notes/syllabus as text - no file needed. */
  createFromText: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string().min(1).max(200),
        type: z.enum(MATERIAL_TYPES).default("NOTES"),
        text: z.string().min(1).max(400_000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireEnrollment(ctx.userId, input.courseId);
      const material = await ctx.prisma.material.create({
        data: {
          courseId: input.courseId,
          uploaderId: ctx.userId,
          title: input.title,
          type: input.type,
          extractedText: input.text,
        },
      });
      await recordActivity(ctx.userId, "MATERIAL_UPLOADED");
      return { id: material.id };
    }),

  // TODO Phase 4: upvote mutation (MaterialUpvote join table is already in the schema)
});

/**
 * File-upload path. Multipart uploads don't flow through tRPC; the
 * /api/upload route handler (web) receives the file and calls this  -
 * the business logic stays in the shared API package per the spec.
 * Mobile hits the same /api/upload endpoint with its Bearer token.
 */
export async function createMaterialFromFile(opts: {
  userId: string;
  courseId: string;
  title: string;
  filename: string;
  buffer: Buffer;
  fileUrl: string;
}) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: opts.userId, courseId: opts.courseId } },
  });
  if (!enrollment) throw new Error("You need to join this course before uploading materials.");

  const { text, materialType, warning } = await extractTextFromFile(opts.buffer, opts.filename);
  const material = await prisma.material.create({
    data: {
      courseId: opts.courseId,
      uploaderId: opts.userId,
      title: opts.title || opts.filename,
      type: materialType,
      fileUrl: opts.fileUrl,
      extractedText: text,
    },
  });
  await recordActivity(opts.userId, "MATERIAL_UPLOADED");
  return { id: material.id, warning, extractedChars: text.length };
}
