-- すべてのDB操作（予約作成・取消）を記録する監査ログ
CREATE TABLE IF NOT EXISTS activity_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  action          TEXT NOT NULL,            -- 'create' | 'cancel'
  car_id          TEXT NOT NULL,
  user_name       TEXT NOT NULL,
  start_at        TEXT NOT NULL,
  end_at          TEXT NOT NULL,
  return_location TEXT NOT NULL,
  at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_log_id ON activity_log (id DESC);
