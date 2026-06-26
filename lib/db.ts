import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { productsTable } from "./schema/products";
import { trackedItemsTable } from "./schema/tracked";
import { usersTable } from "./schema/users";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export { productsTable, trackedItemsTable, usersTable };
