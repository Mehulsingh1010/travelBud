// db/schema/expenses.ts
import { pgTable, serial, integer, varchar, boolean, timestamp, text } from "drizzle-orm/pg-core";
import {trips, users} from "../schema"

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amountOriginal: integer("amount_original").notNull(),
  currencyOriginal: varchar("currency_original", { length: 10 }).notNull(),
  amountConverted: integer("amount_converted").notNull(),
  baseCurrency: varchar("base_currency", { length: 10 }).notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});