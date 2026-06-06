import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { getEnv } from "@/lib/env";
import * as schema from "@/db/schema";

function resolveSqlitePath(databaseUrl: string) {
  if (databaseUrl.startsWith("file:")) {
    const filePath = databaseUrl.slice(5);
    return path.resolve(process.cwd(), filePath);
  }

  return path.resolve(process.cwd(), databaseUrl);
}

const sqlite = new Database(resolveSqlitePath(getEnv().databaseUrl));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS coins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numista_id TEXT,
    title TEXT NOT NULL,
    country TEXT NOT NULL,
    issuer TEXT,
    denomination TEXT,
    currency TEXT,
    year TEXT,
    min_year INTEGER,
    max_year INTEGER,
    composition TEXT,
    weight REAL,
    diameter REAL,
    thickness REAL,
    shape TEXT,
    edge TEXT,
    obverse_description TEXT,
    reverse_description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    condition TEXT,
    acquisition_date TEXT,
    acquisition_price REAL,
    storage_location TEXT,
    notes TEXT,
    source_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS coin_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin_id INTEGER NOT NULL REFERENCES coins(id) ON DELETE CASCADE,
    side TEXT NOT NULL DEFAULT 'unknown',
    file_path TEXT NOT NULL,
    original_file_name TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    ocr_text TEXT,
    ai_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS identification_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_type TEXT NOT NULL,
    input_text TEXT,
    image_path TEXT,
    extracted_text TEXT,
    ai_summary TEXT,
    normalized_query TEXT,
    local_results_json TEXT,
    numista_results_json TEXT,
    selected_numista_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export const db = drizzle(sqlite, { schema });
