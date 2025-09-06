import { pgTable, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { trips, users } from "../schema";

export const settlements = pgTable("settlements", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // base currency smallest units
  currency: varchar("currency", { length: 10 }).notNull(),
  note: varchar("note", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});