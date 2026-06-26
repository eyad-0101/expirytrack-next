import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, usersTable } from "./db";
import { NextResponse } from "next/server";

export type DbUser = {
  id: number;
  email: string;
  role: string;
  clerkUserId: string | null;
};

/**
 * Call at the top of every API route handler that requires auth.
 * Returns { dbUser } on success or a NextResponse 401/500 on failure.
 */
export async function requireAuth(): Promise<
  { dbUser: DbUser; error?: never } | { dbUser?: never; error: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);

  if (existing[0]) return { dbUser: existing[0] };

  // JIT provision
  let email = `${userId}@unknown.com`;
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    email = clerkUser.emailAddresses[0]?.emailAddress ?? email;
  } catch {
    // fall through
  }

  const byEmail = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (byEmail[0]) {
    const [updated] = await db
      .update(usersTable)
      .set({ clerkUserId: userId })
      .where(eq(usersTable.id, byEmail[0].id))
      .returning();
    return { dbUser: updated };
  }

  const count = await db.$count(usersTable);
  const role = count === 0 ? "admin" : "user";

  const [created] = await db
    .insert(usersTable)
    .values({ email, clerkUserId: userId, role })
    .onConflictDoUpdate({
      target: usersTable.email,
      set: { clerkUserId: userId },
    })
    .returning();

  return { dbUser: created };
}

export async function requireAdmin(): Promise<
  { dbUser: DbUser; error?: never } | { dbUser?: never; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.dbUser.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 }) };
  }
  return result;
}
