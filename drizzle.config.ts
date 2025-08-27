import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_xTpfcLlk23id@ep-odd-leaf-a8kkpjio-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
  },
});
