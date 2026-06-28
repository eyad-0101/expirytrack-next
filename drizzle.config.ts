import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  dialect: "mysql",
  schema: [
    "./lib/schema/products.ts",
    "./lib/schema/tracked.ts",
    "./lib/schema/users.ts",
  ],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});