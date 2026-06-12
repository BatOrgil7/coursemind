// Shared auth logic for BOTH platforms:
//  - Web: NextAuth's Credentials provider calls verifyCredentials()
//  - Mobile: POST /api/mobile/login calls verifyCredentials() then
//    signMobileToken(); every later request sends "Authorization: Bearer <jwt>"
// One user store, one password check, two transport mechanisms.
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@coursemind/db";

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Run `npm run setup` to generate env files, or add AUTH_SECRET to apps/web/.env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

export function schoolDomainFromEmail(email: string): string | null {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split("@")[1]?.trim();
  return domain && domain.includes(".") ? domain : null;
}

export function isPersonalEmailDomain(domain: string): boolean {
  return FREE_MAIL_DOMAINS.has(domain.toLowerCase().trim());
}

export function prettifyDomain(domain: string): string {
  const base = domain.split(".")[0];
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} (${domain})`;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export interface SignupInput {
  email: string;
  name: string;
  password: string;
}

export async function signupUser({ email, name, password }: SignupInput) {
  const normalized = email.toLowerCase().trim();
  const domain = schoolDomainFromEmail(normalized);
  if (!domain) throw new Error("Please enter a valid email address.");

  // University-email verification: personal-mail domains are rejected.
  // First student from an unknown .edu-style domain auto-creates their
  // university's space (self-serve growth - the space is named after the
  // domain and can be renamed later by an instructor).
  if (isPersonalEmailDomain(domain)) {
    throw new Error(
      "Hyntor uses your university email to connect you with your classmates. Please sign up with your school email address (for the demo, use any name @demo.edu)."
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new Error("An account with this email already exists. Try logging in instead.");

  let university = await prisma.university.findUnique({ where: { emailDomain: domain } });
  if (!university) {
    university = await prisma.university.create({
      data: { name: prettifyDomain(domain), emailDomain: domain },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email: normalized, name: name.trim(), passwordHash, universityId: university.id },
  });
}

// ---------- Mobile JWT ----------

const MOBILE_TOKEN_TTL = "30d";

export async function signMobileToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, platform: "mobile" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_TTL)
    .sign(getSecretKey());
}

export async function verifyMobileToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
