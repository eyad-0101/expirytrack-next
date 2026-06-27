import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, productsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const ProductUpdate = z.object({
  barcode: z.string().optional(),
  name: z.string().optional(),
  // Accept number from client, store as string for MySQL decimal column
  price: z.coerce.number().optional().transform((v) => (v !== undefined ? String(v) : undefined)),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  const numId = parseInt(id);

  const body = await req.json();
  const parsed = ProductUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  await db
    .update(productsTable)
    .set(parsed.data)
    .where(eq(productsTable.id, numId));

  const [updated] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, numId))
    .limit(1);

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...updated, price: Number(updated.price) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  await db.delete(productsTable).where(eq(productsTable.id, parseInt(id)));
  return new NextResponse(null, { status: 204 });
}
