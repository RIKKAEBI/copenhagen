-- 車予約テーブル
CREATE TABLE IF NOT EXISTS reservations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name       TEXT NOT NULL,
  car_id          TEXT NOT NULL,            -- 'copen' | 'vamos'
  start_at        TEXT NOT NULL,            -- ISO 8601
  end_at          TEXT NOT NULL,            -- ISO 8601
  return_location TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_car_start
  ON reservations (car_id, start_at);
