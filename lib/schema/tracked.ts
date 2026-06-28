import { mysqlTable, int, varchar, date, text } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { productsTable } from "./products";

export const trackedItemsTable = mysqlTable("tracked_items", {
  id:          int("id").autoincrement().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }),
  productId:   int("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  expiryDate:  date("expiry_date", { mode: "string" }).notNull(),
  quantity:    int("quantity").notNull().default(1),
  notes:       text("notes").notNull().$default(() => ""),
});

export const insertTrackedItemSchema = createInsertSchema(trackedItemsTable).omit({ id: true });
export type InsertTrackedItem = z.infer<typeof insertTrackedItemSchema>;
export type TrackedItem = typeof trackedItemsTable.$inferSelect;