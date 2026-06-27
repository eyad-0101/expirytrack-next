import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db, trackedItemsTable, productsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateTrackedBody = z.object({
  productId: z.number().optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  quantity: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { dbUser } = result;

  const { id } = await params;
  const numId = parseInt(id);

  const [existing] = await db
    .select()
    .from(trackedItemsTable)
    .where(eq(trackedItemsTable.id, numId))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = dbUser.role === "admin";
  if (!isAdmin && existing.clerkUserId !== dbUser.clerkUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateTrackedBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  // MySQL has no RETURNING — update then re-select with join
  await db
    .update(trackedItemsTable)
    .set(parsed.data)
    .where(eq(trackedItemsTable.id, numId));

  const [row] = await db
    .select()
    .from(trackedItemsTable)
    .innerJoin(productsTable, eq(trackedItemsTable.productId, productsTable.id))
    .where(eq(trackedItemsTable.id, numId));

  return NextResponse.json({
    ...row.tracked_items,
    product: { ...row.products, price: Number(row.products.price) },
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { dbUser } = result;

  const { id } = await params;
  const numId = parseInt(id);

  const [existing] = await db
    .select()
    .from(trackedItemsTable)
    .where(eq(trackedItemsTable.id, numId))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = dbUser.role === "admin";
  if (!isAdmin && existing.clerkUserId !== dbUser.clerkUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(trackedItemsTable).where(eq(trackedItemsTable.id, numId));
  return new NextResponse(null, { status: 204 });
}
