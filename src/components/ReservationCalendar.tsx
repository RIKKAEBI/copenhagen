"use client";

import { useEffect, useMemo, useState } from "react";
import { CARS } from "@/lib/cars";
import type { Reservation } from "@/lib/types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 予約が覆う日（YYYY-MM-DD）の集合を返す（複数日にまたがる予約に対応） */
function coveredDays(r: Reservation): string[] {
  const days: string[] = [];
  const start = startOfDay(new Date(r.startAt));
  const end = startOfDay(new Date(r.endAt));
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(ymd(d));
  }
  return days;
}

function hhmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export function ReservationCalendar({
  reservations,
  accent,
  onSelectDate,
}: {
  reservations: Reservation[];
  accent: string;
  onSelectDate: (date: Date) => void;
}) {
  // 「現在日時」依存の描画はマウント後にだけ行う（SSR/プリレンダ時の日付と
  // クライアントの日付がズレてハイドレーション不一致になるのを防ぐ）。
  const [cursor, setCursor] = useState<Date | null>(null);
  const [todayKey, setTodayKey] = useState<string>("");
  useEffect(() => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setTodayKey(ymd(now));
  }, []);

  // 日付キー → その日の予約一覧
  const byDay = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of reservations) {
      for (const day of coveredDays(r)) {
        const arr = map.get(day) ?? [];
        arr.push(r);
        map.set(day, arr);
      }
    }
    for (const arr of map.values()) arr.sort((a, b) => a.startAt.localeCompare(b.startAt));
    return map;
  }, [reservations]);

  // 月グリッド（日曜始まり、6週ぶん）
  const cells = useMemo(() => {
    if (!cursor) return [];
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [cursor]);

  const monthLabel = cursor ? cursor.toLocaleDateString("ja-JP", { year: "numeric", month: "long" }) : "";

  function shiftMonth(delta: number) {
    setCursor((c) => (c ? new Date(c.getFullYear(), c.getMonth() + delta, 1) : c));
  }

  // マウント前（SSR / 初回クライアント描画）は日付に依存しないスケルトンを描く
  if (!cursor) {
    return (
      <div className="hud-frame p-4">
        <div className="mb-3 font-mono text-[10px] tracking-[0.3em] text-white/40">RESERVATION CALENDAR</div>
        <div className="grid h-[420px] place-items-center font-mono text-xs tracking-widest text-white/30">
          LOADING CALENDAR...
        </div>
      </div>
    );
  }

  return (
    <div className="hud-frame p-4">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/40">RESERVATION CALENDAR</span>
          <h2 className="text-lg font-bold tracking-wide tabular-nums" style={{ color: accent }}>
            {monthLabel}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftMonth(-1)} className="cal-nav" aria-label="前の月">
            ◀
          </button>
          <button
            type="button"
            onClick={() => setCursor(startOfDay(new Date()))}
            className="cal-nav px-3 text-[11px] tracking-widest"
          >
            今日
          </button>
          <button type="button" onClick={() => shiftMonth(1)} className="cal-nav" aria-label="次の月">
            ▶
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-white/10 pb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center font-mono text-[11px] tracking-widest ${
              i === 0 ? "text-red-400/70" : i === 6 ? "text-sky-400/70" : "text-white/45"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日セル */}
      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const key = ymd(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = key === todayKey;
          const dayRes = byDay.get(key) ?? [];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(d)}
              title="クリックでこの日を予約"
              className={`group relative flex min-h-[84px] flex-col gap-1 border-b border-r border-white/8 p-1.5 text-left transition-colors hover:bg-white/[0.04] ${
                inMonth ? "" : "opacity-35"
              }`}
            >
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  isToday ? "font-bold text-black" : "text-white/55"
                } ${isToday ? "inline-flex h-5 w-5 items-center justify-center rounded-full" : ""}`}
                style={isToday ? { background: accent } : undefined}
              >
                {d.getDate()}
              </span>

              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayRes.slice(0, 3).map((r) => {
                  const car = CARS[r.carId];
                  return (
                    <span
                      key={r.id}
                      className="truncate rounded-sm px-1 py-0.5 text-[10px] leading-tight text-white/90"
                      style={{ background: `${car.accent}26`, borderLeft: `2px solid ${car.accent}` }}
                    >
                      {hhmm(r.startAt)} {car.name}・{r.userName}
                    </span>
                  );
                })}
                {dayRes.length > 3 && (
                  <span className="px-1 text-[10px] text-white/45">+{dayRes.length - 3} 件</span>
                )}
              </div>

              {/* ホバー時の + 追加ヒント */}
              <span
                className="pointer-events-none absolute right-1 top-1 text-[12px] opacity-0 transition-opacity group-hover:opacity-60"
                style={{ color: accent }}
              >
                ＋
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
