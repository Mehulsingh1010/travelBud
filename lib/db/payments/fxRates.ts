import { pgTable, serial, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

export const fxRates = pgTable("fx_rates", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 100 }).notNull(),
  base: varchar("base", { length: 10 }).notNull(),
  rates: jsonb("rates").$type<Record<string, number>>().notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});