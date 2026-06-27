import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { productsTable } from "./schema/products";
import { trackedItemsTable } from "./schema/tracked";
import { usersTable } from "./schema/users";

// mysql2 pool — drizzle-orm ≥ 0.28 exposes onConflictDoUpdate for MySQL too,
// but only via the mysqlTable dialect. If you see "not a function" errors
// make sure you are on drizzle-orm ≥ 0.28 (current package.json pins ^0.45).
const pool = mysql.createPool(process.env.DATABASE_URL!);
export const db = drizzle(pool);

export { productsTable, trackedItemsTable, usersTable };
