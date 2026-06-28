"use client";

import { CAR_LIST, type CarId } from "@/lib/cars";

export function CarSelector({ selected, onSelect }: { selected: CarId; onSelect: (id: CarId) => void }) {
  return (
    <div className="flex gap-3">
      {CAR_LIST.map((car) => {
        const active = car.id === selected;
        return (
          <button
            key={car.id}
            type="button"
            onClick={() => onSelect(car.id)}
            className={`group relative flex-1 overflow-hidden border px-4 py-3 text-left transition-all ${
              active ? "border-transparent" : "border-black/15 hover:border-black/30"
            }`}
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)",
              background: active ? `linear-gradient(135deg, ${car.accent}26, transparent 70%)` : "rgba(0,0,0,0.02)",
              boxShadow: active ? `inset 0 0 0 1px ${car.accent}, 0 0 24px -8px ${car.accent}` : undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-black/45">{car.maker}</div>
                <div className="text-lg font-bold tracking-wide text-black">{car.name}</div>
              </div>
              <div
                className="font-mono text-[11px] tabular-nums tracking-widest"
                style={{ color: active ? car.accent : "rgba(0,0,0,0.35)" }}
              >
                {car.code}
              </div>
            </div>
            {active && (
              <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: car.accent, boxShadow: `0 0 12px ${car.accent}` }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
