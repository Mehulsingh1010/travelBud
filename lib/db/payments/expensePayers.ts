import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { expenses } from "./expenses";
import { users } from "../schema";

export const expensePayers = pgTable("expense_payers", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in base currency smallest units
  mode: varchar("mode", { length: 20 }).notNull().default("absolute"), // absolute | percentage | shares
  shareValue: integer("share_value"),
});