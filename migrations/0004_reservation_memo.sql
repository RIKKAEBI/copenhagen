-- 予約にメモ（任意のテキスト）を追加
ALTER TABLE reservations ADD COLUMN memo TEXT NOT NULL DEFAULT '';
