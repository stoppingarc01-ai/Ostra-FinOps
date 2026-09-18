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

