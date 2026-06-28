"use client";

import { useEffect, useState } from "react";
import { CARS } from "@/lib/cars";
import { isAllDay, type Activity } from "@/lib/types";
import { fmtJst, hmJst } from "@/lib/datetime";
import { ChevronLeft, ChevronRight, MapPin, User } from "lucide-react";

const PAGE_SIZE = 10;

function atLabel(iso: string): string {
  return fmtJst(iso, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const hhmm = hmJst;

function rangeLabel(a: Activity): string {
  if (isAllDay(a)) return "終日";
  return `${hhmm(a.startAt)}–${hhmm(a.endAt)}`;
}

/** refreshKey が変わると先頭ページに戻して再取得する */
export function ActivityLog({ refreshKey = 0 }: { refreshKey?: number }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // 新しい操作が起きたら1ページ目に戻す
  useEffect(() => {
    setPage(1);
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/activity?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((r) => r.json() as Promise<{ activities: Activity[]; total: number }>)
      .then((d) => {
        if (cancelled) return;
        setActivities(d.activities ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="hud-frame p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] text-black/40">ACTIVITY LOG</div>
        <div className="font-mono text-[10px] text-black/35">
          {total > 0 ? `${from}–${to} / ${total} 件` : "操作履歴"}
        </div>
      </div>

      {!loaded ? (
        <p className="py-4 text-center text-[13px] text-black/30">読み込み中...</p>
      ) : total === 0 ? (
        <p className="py-4 text-center text-[13px] text-black/35">操作履歴はありません。</p>
      ) : (
        <>
          <ul>
            {activities.map((a) => {
              const car = CARS[a.carId];
              const badge =
                a.action === "create"
                  ? { label: "予約", color: "#15803d", base: "#16a34a" }
                  : a.action === "update"
                    ? { label: "変更", color: "#1d4ed8", base: "#2563eb" }
                    : { label: "取消", color: "#dc2626", base: "#dc2626" };
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-black/[0.08] py-2 text-[12px] last:border-0"
                >
                  <span
                    className="w-12 shrink-0 px-1.5 py-0.5 text-center text-[10px] font-bold"
                    style={{ background: `${badge.base}18`, color: badge.color, borderLeft: `2px solid ${badge.base}` }}
                  >
                    {badge.label}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-black/45">{atLabel(a.at)}</span>
                  <span className="shrink-0 font-bold" style={{ color: car.accent }}>
                    {car.name}
                  </span>
                  <span className="shrink-0 font-mono text-black/70">{rangeLabel(a)}</span>
                  <span className="inline-flex items-center gap-1 text-black/55">
                    <User size={13} className="text-black/35" /> {a.userName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-black/45">
                    <MapPin size={13} className="text-black/30" /> {a.returnLocation}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* ページネーション */}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="cal-nav inline-flex items-center gap-1 px-3 text-[11px] tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={13} /> 前へ
            </button>
            <span className="font-mono text-[11px] tabular-nums text-black/50">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="cal-nav inline-flex items-center gap-1 px-3 text-[11px] tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
            >
              次へ <ChevronRight size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
