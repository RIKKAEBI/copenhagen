"use client";

import { useEffect, useState } from "react";
import { CAR_LIST } from "@/lib/cars";
import type { Reservation } from "@/lib/types";
import { fmtJst } from "@/lib/datetime";
import { Car, MapPin } from "lucide-react";

/** 既定の所在地（予約履歴が無い場合） */
const DEFAULT_LOCATION = "本社 第1駐車場";

type Status =
  | { kind: "in-use"; userName: string; returnLocation: string; until: string }
  | { kind: "idle"; location: string };

function fmtTime(iso: string): string {
  return fmtJst(iso, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function VehicleLocations({ reservations }: { reservations: Reservation[] }) {
  // 現在時刻依存なのでマウント後に算出（ハイドレーション不一致防止）
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  function statusOf(carId: string): Status {
    const list = reservations.filter((r) => r.carId === carId);
    const ts = now ?? 0;
    const current = list.find((r) => new Date(r.startAt).getTime() <= ts && ts < new Date(r.endAt).getTime());
    if (current) {
      return { kind: "in-use", userName: current.userName, returnLocation: current.returnLocation, until: current.endAt };
    }
    // 直近に返却済みの予約から現在地を推定
    const past = list
      .filter((r) => new Date(r.endAt).getTime() <= ts)
      .sort((a, b) => b.endAt.localeCompare(a.endAt));
    return { kind: "idle", location: past[0]?.returnLocation ?? DEFAULT_LOCATION };
  }

  return (
    <div className="hud-frame p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] text-black/40">VEHICLE LOCATION</div>
        <div className="font-mono text-[10px] text-black/40">所在地</div>
      </div>

      <ul className="space-y-1.5">
        {CAR_LIST.map((car) => {
          const st = now === null ? null : statusOf(car.id);
          const inUse = st?.kind === "in-use";
          return (
            <li
              key={car.id}
              className="flex items-center gap-2 border-l-2 bg-black/[0.03] px-2.5 py-1.5"
              style={{ borderColor: car.accent }}
            >
              <span className="w-12 shrink-0 text-sm font-bold" style={{ color: car.accent }}>
                {car.name}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-1 truncate text-[12px] text-black/75">
                {st === null ? (
                  <span className="text-black/35">読み込み中...</span>
                ) : st.kind === "in-use" ? (
                  <>
                    <Car size={14} className="shrink-0 text-black/45" />
                    <span className="truncate">
                      使用中（{st.userName} さん）
                      <span className="text-black/45"> ・ 返却 {fmtTime(st.until)} ・ {st.returnLocation}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} className="shrink-0 text-black/40" />
                    <span className="truncate">{st.location}</span>
                  </>
                )}
              </div>

              <span
                className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] tracking-widest"
                style={{
                  color: inUse ? "#b45309" : car.accent,
                  background: inUse ? "#f59e0b22" : `${car.accent}22`,
                }}
              >
                {st === null ? "…" : inUse ? "IN USE" : "READY"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
