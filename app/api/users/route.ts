import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, usersTable } from "@/lib/db";

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const users = await db.select().from(usersTable).orderBy(usersTable.email);
  return NextResponse.json(users);
}
