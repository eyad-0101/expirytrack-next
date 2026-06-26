import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { db, productsTable } from "@/lib/db";
import { ilike, or } from "drizzle-orm";
import { insertProductSchema } from "@/lib/schema/products";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const whereClause = search
    ? or(
        ilike(productsTable.name, `%${search}%`),
        ilike(productsTable.barcode, `%${search}%`)
      )
    : undefined;

  const rows = await db
    .select()
    .from(productsTable)
    .where(whereClause)
    .limit(limit);

  return NextResponse.json(rows.map((p) => ({ ...p, price: Number(p.price) })));
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const body = await req.json();
  const parsed = insertProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [created] = await db.insert(productsTable).values(parsed.data).returning();
  return NextResponse.json({ ...created, price: Number(created.price) }, { status: 201 });
}
