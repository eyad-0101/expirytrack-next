import { pgTable, serial, integer, text, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { productsTable } from "./products";

export const trackedItemsTable = pgTable("tracked_items", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id"),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  expiryDate: date("expiry_date", { mode: "string" }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  notes: text("notes").notNull().default(""),
});

export const insertTrackedItemSchema = createInsertSchema(trackedItemsTable).omit({ id: true });
export type InsertTrackedItem = z.infer<typeof insertTrackedItemSchema>;
export type TrackedItem = typeof trackedItemsTable.$inferSelect;
