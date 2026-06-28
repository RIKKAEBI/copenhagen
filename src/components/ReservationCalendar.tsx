"use client";

import { useEffect, useMemo, useState } from "react";
import { CARS } from "@/lib/cars";
import { isAllDay, type Reservation } from "@/lib/types";
import { hmJst, ymdJst } from "@/lib/datetime";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 日付キー・時刻はすべて JST
const ymd = ymdJst;
const hhmm = hmJst;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 予約が覆う日（JST の YYYY-MM-DD）の集合を返す（複数日にまたがる予約に対応） */
function coveredDays(r: Reservation): string[] {
  const days = new Set<string>();
  const endKey = ymdJst(new Date(r.endAt));
  let d = new Date(r.startAt);
  days.add(ymdJst(d));
  // 日本は夏時間が無いので 24h 加算で確実に翌 JST 日になる
  while (ymdJst(d) < endKey) {
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    days.add(ymdJst(d));
  }
  return [...days];
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
      <div className="hud-frame p-3 sm:p-4">
        <div className="mb-3 font-mono text-[10px] tracking-[0.3em] text-black/40">RESERVATION CALENDAR</div>
        <div className="grid h-[420px] place-items-center font-mono text-xs tracking-widest text-black/35">
          LOADING CALENDAR...
        </div>
      </div>
    );
  }

  return (
    <div className="hud-frame p-3 sm:p-4">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between">
        <span className="hidden font-mono text-[10px] tracking-[0.3em] text-black/40 sm:inline">RESERVATION CALENDAR</span>
        <div className="ml-auto flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-wide tabular-nums" style={{ color: accent }}>
            {monthLabel}
          </h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shiftMonth(-1)} className="cal-nav" aria-label="前の月">
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setCursor(startOfDay(new Date()))}
              className="cal-nav px-3 text-[11px] tracking-widest"
            >
              今日
            </button>
            <button type="button" onClick={() => shiftMonth(1)} className="cal-nav" aria-label="次の月">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-black/10 pb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center font-mono text-[11px] tracking-widest ${
              i === 0 ? "text-red-400/70" : i === 6 ? "text-sky-400/70" : "text-black/45"
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
              className={`group relative flex min-h-[50px] flex-col gap-0.5 border-b border-r border-black/[0.08] p-1 text-left transition-colors hover:bg-black/[0.05] sm:min-h-[60px] ${
                inMonth ? "" : "opacity-35"
              }`}
              style={isToday ? { background: `${accent}12` } : undefined}
            >
              <span className="font-mono text-[11px] tabular-nums text-black/55">{d.getDate()}</span>

              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayRes.slice(0, 2).map((r) => {
                  const car = CARS[r.carId];
                  return (
                    <div
                      key={r.id}
                      className="px-1 py-0.5 leading-tight"
                      style={{ background: `${car.accent}26`, borderLeft: `2px solid ${car.accent}` }}
                    >
                      <div className="truncate text-[10px] text-black/80">
                        {isAllDay(r) ? "終日" : hhmm(r.startAt)} {car.name}・{r.userName}
                      </div>
                      {r.memo && (
                        <div className="line-clamp-2 whitespace-pre-wrap break-words text-[9px] leading-snug text-black/50">
                          {r.memo}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dayRes.length > 2 && (
                  <span className="px-1 text-[10px] text-black/45">+{dayRes.length - 2} 件</span>
                )}
              </div>

              {/* ホバー時の + 追加ヒント */}
              <span
                className="pointer-events-none absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-60"
                style={{ color: accent }}
              >
                <Plus size={12} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
