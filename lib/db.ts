import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { productsTable } from "./schema/products";
import { trackedItemsTable } from "./schema/tracked";
import { usersTable } from "./schema/users";

const client = connect({ url: process.env.DATABASE_URL! });

export const db = drizzle({ client });
export { productsTable, trackedItemsTable, usersTable };
