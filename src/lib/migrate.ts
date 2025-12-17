import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const db = new Database("sqlite.db");

console.log("Running database migrations...");

try {
  // Check if migrations table exists
  const migrationsTableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
    )
    .get();

  if (!migrationsTableExists) {
    console.log("Creating migrations table...");
    db.exec(`
      CREATE TABLE migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Get executed migrations
  const executedMigrations = db
    .prepare("SELECT filename FROM migrations ORDER BY executed_at")
    .all() as { filename: string }[];

  const executedSet = new Set(executedMigrations.map((m) => m.filename));

  // Get migration files
  const migrationsDir = path.join(__dirname, "../lib/migrations");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files`);

  // Execute pending migrations
  let migrated = 0;
  for (const file of migrationFiles) {
    if (executedSet.has(file)) {
      console.log(`Skipping already executed: ${file}`);
      continue;
    }

    console.log(`Executing migration: ${file}`);

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    try {
      db.exec(sql);

      // Record migration as executed
      db.prepare("INSERT INTO migrations (filename) VALUES (?)").run(file);

      migrated++;
      console.log(`✓ Completed: ${file}`);
    } catch (error) {
      console.error(`✗ Failed to execute ${file}:`, error);
      throw error;
    }
  }

  console.log(`\nMigration completed. ${migrated} migrations executed.`);
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  db.close();
}
