"use client";

import { CARS } from "@/lib/cars";
import type { Reservation } from "@/lib/types";

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPast(r: Reservation): boolean {
  return new Date(r.endAt).getTime() < Date.now();
}

export function ReservationsBoard({
  reservations,
  onCancel,
}: {
  reservations: Reservation[];
  onCancel: (id: number) => void;
}) {
  const upcoming = reservations
    .filter((r) => !isPast(r))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <div className="hud-frame p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] text-white/40">RESERVATION SCHEDULE</div>
        <div className="font-mono text-[10px] text-white/35">{upcoming.length} ACTIVE</div>
      </div>

      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/35">現在、有効な予約はありません。</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((r) => {
            const car = CARS[r.carId];
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 border-l-2 bg-white/[0.02] p-3"
                style={{ borderColor: car.accent }}
              >
                <div className="flex w-16 shrink-0 flex-col items-center">
                  <span className="text-sm font-bold" style={{ color: car.accent }}>
                    {car.name}
                  </span>
                  <span className="font-mono text-[9px] text-white/35">{car.code}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px] text-white/85">
                    {fmt(r.startAt)} <span className="text-white/30">→</span> {fmt(r.endAt)}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-white/50">
                    <span>👤 {r.userName}</span>
                    <span>📍 {r.returnLocation}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCancel(r.id)}
                  className="shrink-0 rounded border border-white/12 px-2 py-1 text-[11px] text-white/50 transition-colors hover:border-red-400/50 hover:text-red-300"
                >
                  取消
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
