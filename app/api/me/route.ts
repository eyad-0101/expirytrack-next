import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { dbUser } = result;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dbUser.id)).limit(1);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
