"use client";

import { CAR_LIST } from "@/lib/cars";
import { isAllDay, type Reservation } from "@/lib/types";
import { fmtJst } from "@/lib/datetime";

function fmt(iso: string): string {
  return fmtJst(iso, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function dateOnly(iso: string): string {
  return fmtJst(iso, { month: "2-digit", day: "2-digit" });
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
  const active = reservations
    .filter((r) => !isPast(r))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const nearestByCar = CAR_LIST.map((car) => ({
    car,
    reservation: active.find((r) => r.carId === car.id) ?? null,
  }));

  return (
    <div className="hud-frame p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] text-black/40">RESERVATION SCHEDULE</div>
        <div className="font-mono text-[10px] text-black/40">{active.length} ACTIVE</div>
      </div>

      <ul className="space-y-1.5">
        {nearestByCar.map(({ car, reservation: r }) => (
          <li
            key={car.id}
            className="flex items-center gap-2 border-l-2 bg-black/[0.03] px-2.5 py-1.5"
            style={{ borderColor: car.accent }}
          >
            <span className="w-12 shrink-0 text-sm font-bold" style={{ color: car.accent }}>
              {car.name}
            </span>
            {r ? (
              <>
                <div className="min-w-0 flex-1 truncate font-mono text-[12px] text-black/75">
                  {isAllDay(r) ? (
                    <>{dateOnly(r.startAt)} 終日</>
                  ) : (
                    <>{fmt(r.startAt)} <span className="text-black/35">→</span> {fmt(r.endAt)}</>
                  )}
                  <span className="text-black/45"> ・ {r.userName} ・ {r.returnLocation}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onCancel(r.id)}
                  className="shrink-0 rounded border border-black/15 px-2 py-0.5 text-[11px] text-black/50 transition-colors hover:border-red-400/50 hover:text-red-600"
                >
                  取消
                </button>
              </>
            ) : (
              <div className="flex-1 text-[12px] text-black/40">直近の予約はありません</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
