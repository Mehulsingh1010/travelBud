import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as centralSchema from "./schema"
import * as paymentSchema from "./payments"
const schema = { ...centralSchema, ...paymentSchema }

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xTpfcLlk23id@ep-odd-leaf-a8kkpjio-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
});
export const db = drizzle(pool, { schema })
