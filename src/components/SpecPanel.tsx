"use client";

import type { Car } from "@/lib/cars";

function StatBar({ label, display, value, accent }: { label: string; display: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 font-mono text-[11px] tracking-widest text-white/55">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-sm bg-white/8">
        <div
          className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-700 ease-out"
          style={{ width: `${Math.round(value * 100)}%`, background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right font-mono text-[11px] text-white/80">{display}</span>
    </div>
  );
}

export function SpecPanel({ car }: { car: Car }) {
  return (
    <div className="flex flex-col gap-5">
      {/* ステータスバー */}
      <div className="hud-frame flex flex-col gap-2.5 p-4">
        <div className="mb-1 font-mono text-[10px] tracking-[0.3em] text-white/40">PERFORMANCE</div>
        {car.stats.map((s) => (
          <StatBar key={s.label} {...s} accent={car.accent} />
        ))}
      </div>

      {/* スペック表 */}
      <div className="hud-frame p-4">
        <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-white/40">SPECIFICATION</div>
        <dl className="divide-y divide-white/8">
          {car.specs.map((spec) => (
            <div key={spec.label} className="flex gap-3 py-1.5 text-[13px]">
              <dt className="w-28 shrink-0 text-white/45">{spec.label}</dt>
              <dd className="flex-1 text-white/85">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
