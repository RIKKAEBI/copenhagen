// 日時はすべて日本時間（JST / Asia/Tokyo）で扱う。
// 表示する端末や実行環境のタイムゾーンに依存しないようにする。

export const TZ = "Asia/Tokyo";

/** ISO/Date を JST で整形する */
export function fmtJst(value: string | Date, options: Intl.DateTimeFormatOptions): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("ja-JP", { timeZone: TZ, ...options });
}

/** JST の "HH:MM"（24時間・ゼロ埋め。input[type=time] にも使える） */
export function hmJst(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

/** JST の { 時, 分 } */
export function hourMinuteJst(iso: string): { h: number; m: number } {
  const [h, m] = hmJst(iso).split(":").map(Number);
  return { h, m };
}

/** JST の "YYYY-MM-DD"（カレンダーの日付キー用） */
export function ymdJst(d: Date): string {
  // en-CA は YYYY-MM-DD 形式
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** 年・月(0始まり)・日 + "HH:MM"(JST) から、正しい時刻の Date を作る */
export function combineJst(year: number, month: number, day: number, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  // +09:00（JST）を明示してパース
  return new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(h)}:${pad(m)}:00+09:00`);
}
