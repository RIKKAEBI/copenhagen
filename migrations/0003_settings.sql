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
  ('location', '本社 第1駐車場'),
  ('location', '本社 第2駐車場'),
  ('location', '東棟 地下P'),
  ('location', '西営業所'),
  ('location', '倉庫前スペース');
