// Conditional database import to handle build-time issues
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

let db: NodePgDatabase | BetterSQLite3Database | any;

try {
  // Try to import the real database
  const Database = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  
  const sqlite = new Database.default("sqlite.db");
  db = drizzle(sqlite);
} catch (error) {
  // Fallback to a mock database for build-time
  console.warn("Database not available, using mock for build:", (error as Error).message);
  
  // Create a minimal mock that satisfies TypeScript
  db = {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => [],
          all: () => [],
          get: () => null,
          limit: () => ({
            offset: () => [],
          }),
        }),
        insert: () => ({
          values: () => ({
            returning: () => [],
            run: () => ({ changes: 0 }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => [],
            }),
          }),
        }),
        delete: () => ({
          where: () => ({
            run: () => ({ changes: 0 }),
          }),
        }),
      }),
    }),
    transaction: (callback: (tx: unknown) => Promise<unknown>) => callback(db),
  };
}

export { db };
