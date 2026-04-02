import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// This is a helper to get the database instance
// In Cloudflare Workers, we pass the D1 binding (c.env.DB)
// In local Node.js dev, we fall back to better-sqlite3
export function getDb(env?: any) {
  if (env && env.DB) {
    return drizzle(env.DB, { schema });
  }
  
  // Fallback for local development if D1 binding is not available
  const sqlite = new Database('local.db');
  return drizzleSqlite(sqlite, { schema });
}
