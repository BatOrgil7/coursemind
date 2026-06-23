// Multipart file upload endpoint (multipart doesn't flow through tRPC).
// All the real work - enrollment check, text extraction, DB write, XP -
// happens in @coursemind/api's createMaterialFromFile, so mobile can hit
// this same endpoint with its Bearer token and identical behavior.
//
// Dev storage: files land in apps/web/uploads/ (gitignored).
// TODO: swap to object storage (S3/R2) for production file uploads.
// On serverless hosts (Vercel) the filesystem is ephemeral/read-only, so
// disk uploads can't persist - we detect that and steer the student to the
// paste-text path instead of failing with a confusing disk error.
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createMaterialFromFile, verifyMobileToken } from "@coursemind/api";
import { auth } from "@/auth";

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  // Resolve the caller from either transport (web session or mobile JWT).
  const session = await auth();
  let userId = session?.user?.id ?? null;
  if (!userId) {
    const header = req.headers.get("authorization");
    if (header?.startsWith("Bearer ")) {
      userId = await verifyMobileToken(header.slice("Bearer ".length));
    }
  }
  if (!userId) {
    return NextResponse.json({ error: "Please log in to upload." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const courseId = form.get("courseId");
  const title = form.get("title");
  if (!(file instanceof File) || typeof courseId !== "string") {
    return NextResponse.json({ error: "Missing file or courseId." }, { status: 400 });
  }
  // Serverless filesystems are ephemeral - a saved file wouldn't survive the
  // request. Until object storage is wired up, guide the student to paste the
  // text instead (which works everywhere and is what the AI tutor reads).
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "File uploads aren't available on the hosted site yet. Use \"Paste text\" on the upload page instead - that's exactly what the AI tutor reads, and it works the same.",
      },
      { status: 503 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is larger than 25 MB. Try splitting it or pasting the text directly." },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${crypto.randomBytes(8).toString("hex")}-${safeName}`;
  const uploadsDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, storedName), buffer);

  try {
    const result = await createMaterialFromFile({
      userId,
      courseId,
      title: typeof title === "string" && title.trim() ? title.trim() : file.name,
      filename: file.name,
      buffer,
      fileUrl: `uploads/${storedName}`,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 }
    );
  }
}
