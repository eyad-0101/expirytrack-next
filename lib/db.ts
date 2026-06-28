import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { productsTable } from "./schema/products";
import { trackedItemsTable } from "./schema/tracked";
import { usersTable } from "./schema/users";

// mysql2 pool — drizzle-orm ≥ 0.28 exposes onConflictDoUpdate for MySQL too,
// but only via the mysqlTable dialect. If you see "not a function" errors
// make sure you are on drizzle-orm ≥ 0.28 (current package.json pins ^0.45).
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  connectionLimit: 5,
  maxIdle: 5,
  idleTimeout: 60_000,       // 1 min — well under TiDB Cloud Starter's 30-min cutoff
  enableKeepAlive: false,    // TiDB's public endpoint doesn't support TCP keep-alive
});

export const db = drizzle(pool);
export { productsTable, trackedItemsTable, usersTable };
