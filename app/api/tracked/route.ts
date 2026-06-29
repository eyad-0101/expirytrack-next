import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db, trackedItemsTable, productsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const CreateTrackedBody = z.object({
  productId: z.number(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().optional(),
});

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { dbUser } = result;
  const isAdmin = dbUser.role === "admin";

  if (isAdmin) {
    const rows = await db
      .select()
      .from(trackedItemsTable)
      .innerJoin(productsTable, eq(trackedItemsTable.productId, productsTable.id))
      .leftJoin(usersTable, eq(trackedItemsTable.clerkUserId, usersTable.clerkUserId))
      .orderBy(trackedItemsTable.expiryDate);

    return NextResponse.json(
      rows.map(({ tracked_items, products, users }) => ({
        ...tracked_items,
        userEmail:    users?.email    ?? undefined,
        userUsername: users?.username ?? undefined,
        product: { ...products, price: Number(products.price) },
      }))
    );
  }

  const rows = await db
    .select()
    .from(trackedItemsTable)
    .innerJoin(productsTable, eq(trackedItemsTable.productId, productsTable.id))
    .where(eq(trackedItemsTable.clerkUserId, dbUser.clerkUserId ?? ""))
    .orderBy(trackedItemsTable.expiryDate);

  return NextResponse.json(
    rows.map(({ tracked_items, products }) => ({
      ...tracked_items,
      product: { ...products, price: Number(products.price) },
    }))
  );
}

export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { dbUser } = result;

  const body = await req.json();
  const parsed = CreateTrackedBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  // MySQL has no RETURNING — use $returningId() then re-select with join
  const [{ id: newId }] = await db
    .insert(trackedItemsTable)
    .values({
      clerkUserId: dbUser.clerkUserId,
      productId: parsed.data.productId,
      expiryDate: parsed.data.expiryDate,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes ?? "",
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(trackedItemsTable)
    .innerJoin(productsTable, eq(trackedItemsTable.productId, productsTable.id))
    .where(eq(trackedItemsTable.id, newId));

  return NextResponse.json(
    { ...row.tracked_items, product: { ...row.products, price: Number(row.products.price) } },
    { status: 201 }
  );
}
