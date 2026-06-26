import type { Config } from "drizzle-kit";

export default {
  schema: ["./lib/schema/products.ts", "./lib/schema/tracked.ts", "./lib/schema/users.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
