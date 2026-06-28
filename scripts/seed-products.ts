/**
 * Product seeder — reads Items.xlsx and inserts all products into the DB.
 *
 * Usage:
 *   npx tsx scripts/seed-products.ts
 *
 * Place Items.xlsx in the project root (next to package.json) before running.
 */

import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { sql } from "drizzle-orm";
import { productsTable } from "../lib/schema/products";
import { config } from "dotenv";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

config({ path: ".env.local" });

const XLSX_PATH = path.resolve(process.cwd(), "Items.xlsx");
const BATCH_SIZE = 500; // TiDB Serverless HTTP has a payload limit — keep batches small

async function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`❌  Items.xlsx not found at: ${XLSX_PATH}`);
    process.exit(1);
  }

  // ── Parse Excel ──────────────────────────────────────────────────────────
  console.log("📖  Reading Items.xlsx …");
  const workbook = XLSX.readFile(XLSX_PATH);
  const sheet = workbook.Sheets["Items"];
  if (!sheet) {
    console.error('❌  Sheet named "Items" not found in the workbook.');
    process.exit(1);
  }

  const raw: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(sheet);

  const products = raw
    .map((row) => {
      const barcode = row["No"] != null
        ? String(Math.round(Number(row["No"])))  // fix scientific notation
        : null;
      const name    = row["Description"] != null ? String(row["Description"]).trim() : null;
      const price   = row["price"]       != null ? Number(Number(row["price"]).toFixed(2)) : null;

      if (!barcode || !name || price === null || isNaN(price)) return null;

      return { barcode, name, price: String(price) }; // decimal column expects string
    })
    .filter((r): r is { barcode: string; name: string; price: string } => r !== null);

  console.log(`✅  Parsed ${products.length} valid products from ${raw.length} rows.`);

  // ── Connect ───────────────────────────────────────────────────────────────
  const client = connect({ url: process.env.DATABASE_URL! });
  const db     = drizzle({ client });

  // ── Seed in batches ───────────────────────────────────────────────────────
  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    try {
      // onDuplicateKeyUpdate with a no-op set = MySQL's equivalent of "skip duplicates"
      await db
        .insert(productsTable)
        .values(batch)
        .onDuplicateKeyUpdate({ set: { id: sql`id` } });

      inserted += batch.length;
      process.stdout.write(
        `\r⏳  Inserted ${inserted} / ${products.length} products …`
      );
    } catch (err) {
      // If a batch fails, try row-by-row so one bad row doesn't block the rest
      for (const row of batch) {
        try {
          await db
            .insert(productsTable)
            .values(row)
            .onDuplicateKeyUpdate({ set: { id: sql`id` } });
          inserted++;
        } catch {
          skipped++;
        }
      }
      process.stdout.write(
        `\r⏳  Inserted ${inserted} / ${products.length} products …`
      );
    }
  }

  console.log(`\n\n🎉  Done!`);
  console.log(`    Inserted : ${inserted}`);
  if (skipped > 0) console.log(`    Skipped  : ${skipped}  (errors — check data)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌  Seeder failed:", err);
  process.exit(1);
});