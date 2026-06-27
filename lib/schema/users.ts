import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email:       varchar("email", { length: 255 }).notNull().unique(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).unique(),
  role:        varchar("role", { length: 20 }).notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
