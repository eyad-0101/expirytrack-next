import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Manually load your environment variables first!
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
    // Format for TiDB:
    // mysql://<prefix>.root:<password>@gateway01.<region>.prod.aws.tidbcloud.com:4000/expirytrack?ssl={"rejectUnauthorized":true}
    //
    // Format for local XAMPP (no SSL needed):
    // mysql://root:@localhost:3306/expirytrack
    url: process.env.DATABASE_URL!,
  },
});
