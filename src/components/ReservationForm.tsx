"use client";

import { useState } from "react";
import { RETURN_LOCATIONS, type Car } from "@/lib/cars";
import type { Reservation } from "@/lib/types";

/** datetime-local の初期値（次の正時） */
function defaultStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalInput(d);
}
function defaultEnd(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return toLocalInput(d);
}
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ReservationForm({
  car,
  onClose,
  onCreated,
}: {
  car: Car;
  onClose: () => void;
  onCreated: (r: Reservation) => void;
}) {
  const [userName, setUserName] = useState("");
  const [startAt, setStartAt] = useState(defaultStart);
  const [endAt, setEndAt] = useState(defaultEnd);
  const [returnLocation, setReturnLocation] = useState<string>(RETURN_LOCATIONS[0]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userName,
          carId: car.id,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          returnLocation,
        }),
      });
      const data = (await res.json()) as { reservation?: Reservation; errors?: string[]; error?: string };
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "予約に失敗しました。"]);
        return;
      }
      if (data.reservation) onCreated(data.reservation);
    } catch {
      setErrors(["通信エラーが発生しました。"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="hud-frame flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-[#070b13]/95 p-6"
        style={{ boxShadow: `inset 0 0 0 1px ${car.accent}55` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-white/40">DEPLOYMENT SEQUENCE</div>
            <h2 className="text-2xl font-bold tracking-wide" style={{ color: car.accent }}>
              {car.name} を予約
            </h2>
            <p className="mt-1 font-mono text-[11px] text-white/40">{car.maker} · {car.code}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-white/15 px-2 py-1 text-xs text-white/60 hover:bg-white/10">
            ✕
          </button>
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 border border-red-500/40 bg-red-500/10 p-3 text-[13px] text-red-300">
            {errors.map((e) => (
              <li key={e}>⚠ {e}</li>
            ))}
          </ul>
        )}

        <Field label="氏名 / PILOT">
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="山田 太郎"
            className="hud-input"
            required
          />
        </Field>

        <Field label="利用開始 / DEPARTURE">
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="hud-input" required />
        </Field>

        <Field label="返却日時 / RETURN">
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="hud-input" required />
        </Field>

        <Field label="返却場所 / BASE">
          <select value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)} className="hud-input">
            {RETURN_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-[#070b13]">
                {loc}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-auto w-full py-3 text-center text-sm font-bold tracking-[0.3em] text-black transition-all disabled:opacity-50"
          style={{ background: car.accent, boxShadow: `0 0 24px -6px ${car.accent}`, clipPath: "polygon(0 0, 100% 0, 96% 100%, 0 100%)" }}
        >
          {submitting ? "PROCESSING..." : "▶ 予約を確定 / DEPLOY"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-[0.25em] text-white/45">{label}</span>
      {children}
    </label>
  );
}
