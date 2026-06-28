-- ユーザー名・返却場所などの設定値
CREATE TABLE IF NOT EXISTS settings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT NOT NULL,            -- 'user' | 'location'
  value      TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (kind, value)
);

-- 既定の返却場所をseed
INSERT OR IGNORE INTO settings (kind, value) VALUES
  ('location', '会社');
