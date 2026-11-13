import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Bump this and add a new `if (version === N)` block for every schema change.
 * Never edit a block that already shipped: users' databases have already run it.
 */
const DATABASE_VERSION = 2;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE class_events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        weekday TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        source TEXT NOT NULL DEFAULT 'print',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    version = 1;
  }

  if (version === 1) {
    await db.execAsync(`ALTER TABLE class_events ADD COLUMN professor TEXT;`);
    version = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
