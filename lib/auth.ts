import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, usersTable } from "./db";
import { NextResponse } from "next/server";

export type DbUser = {
  id: number;
  email: string;
  role: string;
  clerkUserId: string | null;
  username: string | null;
};

/**
 * Call at the top of every API route handler that requires auth.
 * Returns { dbUser } on success or a NextResponse 401/500 on failure.
 *
 * NOTE: onConflictDoUpdate is not available in drizzle-orm's mysql2 dialect.
 * We use a manual select → insert/update pattern instead.
 */
export async function requireAuth(): Promise<
  { dbUser: DbUser; error?: never } | { dbUser?: never; error: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // 1. Fast path — already in DB by clerkUserId; re-sync username from Clerk in case it changed
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);

  if (existing[0]) {
    // Silently refresh username in the background (non-blocking)
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const freshUsername = clerkUser.username ?? null;
      if (freshUsername !== existing[0].username) {
        await db
          .update(usersTable)
          .set({ username: freshUsername })
          .where(eq(usersTable.id, existing[0].id));
        return { dbUser: { ...existing[0], username: freshUsername } };
      }
    } catch {
      // If Clerk is unreachable, return cached row as-is
    }
    return { dbUser: existing[0] };
  }

  // 2. Resolve email + username from Clerk
  let email = `${userId}@unknown.com`;
  let username: string | null = null;
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    email = clerkUser.emailAddresses[0]?.emailAddress ?? email;
    username = clerkUser.username ?? null;
  } catch {
    // fall through with placeholder email
  }

  // 3. Email already in DB (e.g. created by admin before first sign-in)
  const byEmail = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (byEmail[0]) {
    // MySQL has no RETURNING clause — update, then re-select the row.
    await db
      .update(usersTable)
      .set({ clerkUserId: userId, username })
      .where(eq(usersTable.id, byEmail[0].id));

    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, byEmail[0].id))
      .limit(1);

    return { dbUser: updated };
  }

  // 4. JIT provision — first user becomes admin
  // db.$count() already returns Promise<number> on its own — don't wrap it in select().
  const count = await db.$count(usersTable);
  const role = count === 0 ? "admin" : "user";

  // MySQL inserts only give back the inserted id via $returningId(), not the full row.
  const [{ id: newId }] = await db
    .insert(usersTable)
    .values({ email, clerkUserId: userId, username, role })
    .$returningId();

  const [created] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, newId))
    .limit(1);

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