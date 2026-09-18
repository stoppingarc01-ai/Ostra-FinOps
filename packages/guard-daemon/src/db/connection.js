import { DatabaseSync } from 'node:sqlite';
import { dirname } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS local_traces (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  requested_model TEXT NOT NULL,
  routed_model TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd REAL NOT NULL,
  duration_ms INTEGER NOT NULL,
  ttft_ms INTEGER,
  stream INTEGER NOT NULL,
  error_message TEXT,
  timestamp INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_traces_timestamp ON local_traces(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traces_session ON local_traces(session_id);

CREATE TABLE IF NOT EXISTS local_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT NOT NULL,
  target_time TEXT,
  token_budget_usd REAL DEFAULT 0,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_date ON local_tasks(target_date);
`;
/**
 * Initializes SQLite connections in WAL mode with separated write and read handles,
 * ensuring high-frequency daemon writes never block UI read queries.
 */
export function initializeDatabase(dbLocation) {
    if (dbLocation !== ':memory:') {
        const dir = dirname(dbLocation);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }
    // 1. Primary Writer Connection
    const writer = new DatabaseSync(dbLocation);
    writer.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA temp_store = MEMORY;
  `);
    // Initialize schema
    writer.exec(SCHEMA_SQL);
    // 2. Read-Only Query Connection (for UI hydration & summaries)
    // For :memory: databases, we reuse the same connection to preserve in-memory state
    const reader = dbLocation === ':memory:'
        ? writer
        : new DatabaseSync(dbLocation, { readOnly: true });
    if (dbLocation !== ':memory:') {
        reader.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA temp_store = MEMORY;
    `);
    }
    return {
        writer,
        reader,
        close: () => {
            try {
                if (reader !== writer) {
                    reader.close();
                }
                writer.close();
            }
            catch {
                // Ignored if already closed
            }
        },
    };
}
