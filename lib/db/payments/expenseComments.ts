import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { expenses } from "./expenses";
import { users } from "../schema";

export const expenseComments = pgTable("expense_comments", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});