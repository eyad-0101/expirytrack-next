import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UserUpdate = z.object({
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  const body = await req.json();
  const parsed = UserUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, parseInt(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  await db.delete(usersTable).where(eq(usersTable.id, parseInt(id)));
  return new NextResponse(null, { status: 204 });
}
