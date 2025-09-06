CREATE TABLE "expense_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"body" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_payers" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"mode" varchar(20) DEFAULT 'absolute' NOT NULL,
	"share_value" integer
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"amount_original" integer NOT NULL,
	"currency_original" varchar(10) NOT NULL,
	"amount_converted" integer NOT NULL,
	"base_currency" varchar(10) NOT NULL,
	"expense_date" timestamp NOT NULL,
	"created_by" integer,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_splits" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount_owed" integer NOT NULL,
	"mode" varchar(20) DEFAULT 'equal' NOT NULL,
	"share_value" integer
);
--> statement-breakpoint
CREATE TABLE "fx_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(100) NOT NULL,
	"base" varchar(10) NOT NULL,
	"rates" json NOT NULL,
	"fetched_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"note" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trip_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"user_id" integer,
	"rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "trip_feedback_trip_id_user_id_unique" UNIQUE("trip_id","user_id"),
	CONSTRAINT "rating_check" CHECK (rating >= 1 AND rating <= 5)
);
--> statement-breakpoint
CREATE TABLE "trip_join_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"user_id" integer,
	"message" text,
	"status" varchar(20) DEFAULT 'pending',
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"responded_by" integer,
	CONSTRAINT "trip_join_requests_trip_id_user_id_unique" UNIQUE("trip_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "trip_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"user_id" integer,
	"role" varchar(20) DEFAULT 'member',
	"status" varchar(20) DEFAULT 'approved',
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "trip_members_trip_id_user_id_unique" UNIQUE("trip_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"creator_id" integer,
	"invite_code" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'planned',
	"start_date" timestamp,
	"end_date" timestamp,
	"max_members" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "trips_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"trip_id" integer,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"accuracy" numeric(10, 2),
	"timestamp" timestamp DEFAULT now(),
	CONSTRAINT "user_locations_user_id_trip_id_unique" UNIQUE("user_id","trip_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" varchar(500),
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"phone_number" varchar(15),
	"country_code" varchar(5),
	"address" text,
	"description" text,
	"is_name_verified" boolean DEFAULT false,
	"is_phone_verified" boolean DEFAULT false,
	"is_address_verified" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "expense_comments" ADD CONSTRAINT "expense_comments_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_comments" ADD CONSTRAINT "expense_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_payers" ADD CONSTRAINT "expense_payers_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_payers" ADD CONSTRAINT "expense_payers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_feedback" ADD CONSTRAINT "trip_feedback_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_feedback" ADD CONSTRAINT "trip_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_join_requests" ADD CONSTRAINT "trip_join_requests_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;