import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/**/*.{ts,js}',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_BJqirS9kYEH8@ep-dark-forest-a113njrf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  },
});
