import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "../config.js";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const database = new Database(config.databasePath);
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE mockups (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        original_image_path TEXT NOT NULL,
        reference_image_path TEXT NOT NULL,
        generated_image_path TEXT NOT NULL,
        prompt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_mockups_customer_id ON mockups(customer_id);
      CREATE INDEX idx_mockups_created_at ON mockups(created_at DESC);
    `,
  },
];

export function initializeDatabase() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedVersions = new Set(
    database
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row) => (row as { version: number }).version),
  );

  const applyMigration = database.transaction((version: number, sql: string) => {
    database.exec(sql);
    database
      .prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)")
      .run(version, new Date().toISOString());
  });

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      applyMigration(migration.version, migration.sql);
    }
  }
}
