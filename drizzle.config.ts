import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Manually load your environment variables first!
config({ path: ".env.local" }); // Or ".env.local" if that is what you use

export default defineConfig({
  dialect: "mysql",
  schema: [
    "./lib/schema/products.ts",
    "./lib/schema/tracked.ts",
    "./lib/schema/users.ts",
  ],

  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // format: mysql://user:password@host:port/database
  },
});
