import { mysqlTable, int, varchar, decimal } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productsTable = mysqlTable("products", {
  id:      int("id").primaryKey(),
  barcode: varchar("barcode", { length: 64 }).notNull(),
  name:    varchar("name", { length: 255 }).notNull(),
  price:   decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
