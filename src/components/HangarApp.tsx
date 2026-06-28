"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CARS, type CarId } from "@/lib/cars";
import type { Reservation } from "@/lib/types";
import { SpecPanel } from "./SpecPanel";
import { CarSelector } from "./CarSelector";
import { ReservationForm } from "./ReservationForm";
import { ReservationsBoard } from "./ReservationsBoard";

// WebGL は SSR できないのでクライアント専用で読み込む
const CarShowcase = dynamic(() => import("./CarShowcase"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-xs tracking-widest text-white/40">
      LOADING MODEL...
    </div>
  ),
});

export function HangarApp() {
  const [selected, setSelected] = useState<CarId>("copen");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const car = CARS[selected];

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => r.json() as Promise<{ reservations: Reservation[]; warning?: string }>)
      .then((d) => {
        setReservations(d.reservations ?? []);
        if (d.warning) setWarning(d.warning);
      })
      .catch(() => setWarning("予約データの取得に失敗しました。"));
  }, []);

  async function cancel(id: number) {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/reservations/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="scanlines pointer-events-none fixed inset-0 z-0" />

      {/* ヘッダー */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1.5" style={{ background: car.accent, boxShadow: `0 0 12px ${car.accent}` }} />
          <div>
            <h1 className="text-lg font-bold tracking-[0.2em]">CAR DEPLOYMENT</h1>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/40">社用車予約システム // VEHICLE SELECT</p>
          </div>
        </div>
        <Clock />
      </header>

      {warning && (
        <div className="relative z-10 border-b border-amber-400/30 bg-amber-400/10 px-6 py-2 text-center font-mono text-[11px] text-amber-200">
          ⚠ {warning}
        </div>
      )}

      {/* メイン: 3D ショーケース + スペック */}
      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.45fr_1fr]">
        <section className="relative">
          <div className="relative h-[clamp(340px,52vh,560px)] w-full overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
            {/* コーナー装飾 */}
            <Corners />
            <CarShowcase carId={selected} accent={car.accent} />

            {/* オーバーレイ: 機体名 */}
            <div className="pointer-events-none absolute left-5 top-5">
              <div className="font-mono text-[11px] tracking-[0.3em] text-white/45">{car.maker}</div>
              <div className="text-4xl font-black tracking-wide drop-shadow-[0_0_18px_rgba(0,0,0,0.8)]">{car.name}</div>
              <div className="mt-1 inline-block px-2 py-0.5 font-mono text-[11px] tracking-widest" style={{ background: car.accentDim, color: car.accent }}>
                {car.code}
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-5 left-5 right-5 text-[12px] text-white/55">
              {car.tagline}
            </div>
            <div className="pointer-events-none absolute right-5 top-5 font-mono text-[10px] tracking-widest text-white/30">
              DRAG TO ROTATE
            </div>
          </div>

          {/* セレクター + 予約ボタン */}
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <CarSelector selected={selected} onSelect={setSelected} />
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="px-6 py-3 text-sm font-bold tracking-[0.25em] text-black transition-all hover:brightness-110"
              style={{ background: car.accent, boxShadow: `0 0 28px -8px ${car.accent}`, clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" }}
            >
              ▶ この車を予約
            </button>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <SpecPanel car={car} />
        </aside>
      </main>

      {/* 予約スケジュール */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12">
        <ReservationsBoard reservations={reservations} onCancel={cancel} />
      </section>

      {formOpen && (
        <ReservationForm
          car={car}
          onClose={() => setFormOpen(false)}
          onCreated={(r) => {
            setReservations((prev) => [...prev, r]);
            setFormOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Corners() {
  return (
    <>
      {[
        "left-2 top-2 border-l-2 border-t-2",
        "right-2 top-2 border-r-2 border-t-2",
        "left-2 bottom-2 border-l-2 border-b-2",
        "right-2 bottom-2 border-r-2 border-b-2",
      ].map((c) => (
        <div key={c} className={`pointer-events-none absolute z-10 h-6 w-6 border-white/30 ${c}`} />
      ))}
    </>
  );
}

function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("ja-JP", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-right">
      <div className="font-mono text-lg tabular-nums tracking-widest text-white/85">{now}</div>
      <div className="font-mono text-[10px] tracking-[0.2em] text-white/35">
        {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" })}
      </div>
    </div>
  );
}
