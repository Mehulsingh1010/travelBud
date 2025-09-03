import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as centralSchema from "./schema"
import * as paymentSchema from "./payments"
const schema = { ...centralSchema, ...paymentSchema }

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_BJqirS9kYEH8@ep-dark-forest-a113njrf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});
export const db = drizzle(pool, { schema })
