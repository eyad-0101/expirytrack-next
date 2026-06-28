import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { migrate } from "drizzle-orm/tidb-serverless/migrator";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = connect({ url: process.env.DATABASE_URL! });
const db = drizzle({ client });

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Done!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});