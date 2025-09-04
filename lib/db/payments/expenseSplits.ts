import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { expenses } from "./expenses";
import { users } from "../schema";
import { relations } from "drizzle-orm"

export const expenseSplits = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  amountOwed: integer("amount_owed").notNull(), // in base currency smallest units
  mode: varchar("mode", { length: 20 }).notNull().default("equal"), // equal | absolute | percentage | shares
  shareValue: integer("share_value"),
});

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}))