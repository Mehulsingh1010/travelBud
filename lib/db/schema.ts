import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  unique,
  check,
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

  phoneNumber: varchar("phone_number", { length: 15 }),
  countryCode: varchar("country_code", { length: 5 }),
  address: text("address"),
  description: text("description"),
  // SOS contacts stored as JSON string in text columns (nullable)
  sosPhoneNumbers: text("sos_phone_numbers"),
  sosEmails: text("sos_emails"),

  // store if each detail is Aadhaar-verified
  isNameVerified: boolean("is_name_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  isAddressVerified: boolean("is_address_verified").default(false),
})

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: integer("creator_id").references(() => users.id, { onDelete: "cascade" }),
  inviteCode: varchar("invite_code", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 20 }).default("planned"), // planned, active, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxMembers: integer("max_members").default(10),
  isActive: boolean("is_active").default(true),
  baseCurrency: varchar("base_currency", { length: 10 }).default("INR"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const tripMembers = pgTable(
  "trip_members",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).default("member"), // creator, admin, member
    status: varchar("status", { length: 20 }).default("approved"), // approved, pending
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => ({
    uniqueTripUser: unique().on(table.tripId, table.userId),
  }),
)

export const tripJoinRequests = pgTable(
  "trip_join_requests",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
    requestedAt: timestamp("requested_at").defaultNow(),
    respondedAt: timestamp("responded_at"),
    respondedBy: integer("responded_by").references(() => users.id),
  },
  (table) => ({
    uniqueTripUser: unique().on(table.tripId, table.userId),
  }),
)

export const tripFeedback = pgTable(
  "trip_feedback",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating"),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueTripUser: unique().on(table.tripId, table.userId),
    ratingCheck: check("rating_check", sql`rating >= 1 AND rating <= 5`),
  }),
)

export const userLocations = pgTable(
  "user_locations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "cascade" }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
    accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (table) => ({
    uniqueUserTrip: unique().on(table.userId, table.tripId),
  }),
)

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // trip_enrollment, trip_start, trip_update, trip_complete, join_request
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "cascade" }),
    tripName: varchar("trip_name", { length: 255 }),
    relatedUserId: integer("related_user_id").references(() => users.id, { onDelete: "cascade" }),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTrips: many(trips),
  tripMemberships: many(tripMembers),
  locations: many(userLocations),

  // who requested to join
  joinRequests: many(tripJoinRequests, { relationName: "join_request_user" }),
  // who responded (approved/rejected requests)
  respondedJoinRequests: many(tripJoinRequests, { relationName: "join_request_responder" }),
  feedback: many(tripFeedback),
  notifications: many(notifications),
}))

export const tripsRelations = relations(trips, ({ one, many }) => ({
  creator: one(users, {
    fields: [trips.creatorId],
    references: [users.id],
  }),
  members: many(tripMembers),
  locations: many(userLocations),
  joinRequests: many(tripJoinRequests),
  feedback: many(tripFeedback),
  notifications: many(notifications),
}))

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMembers.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripMembers.userId],
    references: [users.id],
  }),
}))

export const tripJoinRequestsRelations = relations(tripJoinRequests, ({ one }) => ({
  trip: one(trips, {
    fields: [tripJoinRequests.tripId],
    references: [trips.id],
  }),
  // who made the join request
  user: one(users, {
    fields: [tripJoinRequests.userId],
    references: [users.id],
    relationName: "join_request_user",
  }),
  // which user responded (approved/rejected)
  respondedByUser: one(users, {
    fields: [tripJoinRequests.respondedBy],
    references: [users.id],
    relationName: "join_request_responder",
  }),
}))

export const tripFeedbackRelations = relations(tripFeedback, ({ one }) => ({
  trip: one(trips, {
    fields: [tripFeedback.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripFeedback.userId],
    references: [users.id],
  }),
}))

export const userLocationsRelations = relations(userLocations, ({ one }) => ({
  user: one(users, {
    fields: [userLocations.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [userLocations.tripId],
    references: [trips.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [notifications.tripId],
    references: [trips.id],
  }),
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
  }),
}))
