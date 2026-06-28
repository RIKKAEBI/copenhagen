"use client";

import { useEffect, useState } from "react";
import { CARS, type CarId } from "@/lib/cars";
import { isAllDay, type Reservation } from "@/lib/types";
import { combineJst, fmtJst, hmJst, ymdJst } from "@/lib/datetime";
import { CalendarDays, Check, Pencil, Plus, Trash2, TriangleAlert, User, X } from "lucide-react";
import { CarSelector } from "./CarSelector";

// 表示・編集の "HH:MM" はすべて JST
const hhmm = hmJst;
const toHM = hmJst;

/** "HH:MM" の1時間後（23:59 を上限にクランプ） */
function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const total = Math.min(h * 60 + m + 60, 23 * 60 + 59);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** JST の日付キー "YYYY-MM-DD" + "HH:MM" から Date を作る */
function combineFromKey(dayKey: string, time: string): Date {
  const [y, mo, d] = dayKey.split("-").map(Number);
  return combineJst(y, mo - 1, d, time);
}

export function ReservationDialog({
  date,
  initialCar,
  reservations = [],
  userNames = [],
  locations = [],
  onCarChange,
  onClose,
  onCreated,
  onUpdated,
  onCancel,
}: {
  date?: Date;
  initialCar: CarId;
  reservations?: Reservation[];
  userNames?: string[];
  locations?: string[];
  onCarChange?: (id: CarId) => void;
  onClose: () => void;
  onCreated: (r: Reservation) => void;
  onUpdated?: (r: Reservation) => void;
  onCancel?: (id: number) => void;
}) {
  // 氏名・返却場所は設定で登録された値のみ（フォールバックなし）
  const userOptions = userNames;
  const noUsers = userOptions.length === 0;
  const locationOptions = locations;
  const noLocations = locationOptions.length === 0;

  const [carId, setCarId] = useState<CarId>(initialCar);
  const [userName, setUserName] = useState<string>("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [allDay, setAllDay] = useState(false);
  const [returnLocation, setReturnLocation] = useState<string>("");
  const [memo, setMemo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ダイアログ表示中は背景（body）のスクロールをロックする
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const baseDate = date ?? new Date();
  // 選択日の JST 日付キー（カレンダーと同じ基準）。これを予約の日付に使う。
  const dayKey = ymdJst(baseDate);
  const car = CARS[carId];
  const dateLabel = fmtJst(`${dayKey}T00:00:00+09:00`, { year: "numeric", month: "long", day: "numeric", weekday: "short" });
  // 必須項目（氏名・返却場所）＋ 時刻が揃い、返却が開始より後か
  const canSubmit =
    !noUsers &&
    userName !== "" &&
    !noLocations &&
    returnLocation !== "" &&
    (allDay || (startTime !== "" && endTime !== "" && endTime > startTime));

  // この日の予約一覧（JST の同じ日に重なるもの）— カレンダーと同じ JST 基準で判定
  const dayReservations = reservations
    .filter((r) => ymdJst(new Date(r.startAt)) <= dayKey && ymdJst(new Date(r.endAt)) >= dayKey)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  function selectCar(id: CarId) {
    setCarId(id);
    onCarChange?.(id);
  }

  // 一覧の予約をクリック → 右フォームに読み込んで編集モードへ
  function startEdit(r: Reservation) {
    setEditingId(r.id);
    setCarId(r.carId);
    onCarChange?.(r.carId);
    setUserName(r.userName);
    setReturnLocation(r.returnLocation);
    setMemo(r.memo ?? "");
    const ad = isAllDay(r);
    setAllDay(ad);
    if (!ad) {
      setStartTime(toHM(r.startAt));
      setEndTime(toHM(r.endAt));
    }
    setErrors([]);
  }

  // 新規予約モードに戻す
  function resetToNew() {
    setEditingId(null);
    setUserName("");
    setReturnLocation("");
    setMemo("");
    setStartTime("09:00");
    setEndTime("11:00");
    setAllDay(false);
    setErrors([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const start = allDay ? combineFromKey(dayKey, "00:00") : combineFromKey(dayKey, startTime);
      const end = allDay ? combineFromKey(dayKey, "23:59") : combineFromKey(dayKey, endTime);
      const payload = {
        userName,
        carId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        returnLocation,
        memo,
      };
      const res = await fetch(editingId ? `/api/reservations/${editingId}` : "/api/reservations", {
        method: editingId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { reservation?: Reservation; errors?: string[]; error?: string };
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? (editingId ? "更新に失敗しました。" : "予約に失敗しました。")]);
        return;
      }
      if (data.reservation) {
        if (editingId) onUpdated?.(data.reservation);
        else onCreated(data.reservation);
      }
    } catch {
      setErrors(["通信エラーが発生しました。"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="hud-frame my-auto max-h-[96vh] w-full max-w-4xl overflow-y-auto bg-white/95"
        style={{ boxShadow: `inset 0 0 0 1px ${car.accent}55, 0 0 60px -20px ${car.accent}` }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-2.5">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-bold tracking-wide" style={{ color: car.accent }}>
              車両を予約
            </h2>
            <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-black/55">
              <CalendarDays size={14} className="text-black/40" /> {dateLabel}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="閉じる" className="rounded border border-black/15 p-1.5 text-black/55 hover:bg-black/5">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[270px_1fr]">
          {/* 左ペイン: この日の予約一覧 */}
          <div className="flex min-h-0 flex-col gap-2 lg:border-r lg:border-black/10 lg:pr-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">この日の予約</span>
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums"
                style={{ background: `${car.accent}22`, color: car.accent }}
              >
                {dayReservations.length} 件
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
              {/* 新規作成カード（編集中のみ表示：新規作成に戻る） */}
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetToNew}
                  className="flex w-full items-center gap-2 border border-dashed border-black/20 bg-black/[0.02] px-2.5 py-2 text-left text-[13px] font-bold text-black/65 transition-colors hover:bg-black/[0.05]"
                >
                  <Plus size={16} style={{ color: car.accent }} />
                  新規予約を作成
                </button>
              )}

              {dayReservations.length === 0 ? (
                <p className="px-3 py-2 text-[12px] text-black/35">この日の予約はまだありません</p>
              ) : (
                dayReservations.map((r) => {
                  const c = CARS[r.carId];
                  const editing = editingId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => startEdit(r)}
                      title="クリックで編集"
                      className={`block w-full border px-2.5 py-1.5 text-left transition-colors hover:bg-black/[0.06] ${
                        editing ? "border-black/30 bg-black/[0.07]" : "border-black/10 bg-black/[0.04]"
                      }`}
                      style={{ borderLeft: `3px solid ${c.accent}` }}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-[11px] font-bold" style={{ color: c.accent }}>
                          {c.name}
                        </span>
                        {isAllDay(r) ? (
                          <span className="font-mono text-[14px] font-bold leading-none text-black">終日</span>
                        ) : (
                          <span className="font-mono text-[15px] font-bold leading-none tabular-nums text-black">
                            {hhmm(r.startAt)}<span className="text-black/35">–</span>{hhmm(r.endAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] text-black/50">
                          <User size={12} className="shrink-0 text-black/35" /> {r.userName}
                        </span>
                        {editing && (
                          <span className="shrink-0 rounded px-1 text-[9px] font-bold" style={{ background: `${c.accent}22`, color: c.accent }}>
                            編集中
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 右ペイン: 予約UI */}
          <div className="flex min-w-0 flex-col gap-2.5">
            {/* 編集中バナー（車両選択より上）＋ 取消ボタン */}
            {editingId !== null && (
              <div className="flex items-center justify-between gap-2 border border-black/15 bg-black/[0.04] px-3 py-1.5">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: car.accent }}>
                  <Pencil size={13} /> 予約を編集中
                </span>
                {onCancel && (
                  <button
                    type="button"
                    onClick={() => {
                      onCancel(editingId);
                      resetToNew();
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded border border-black/15 px-2 py-0.5 text-[11px] text-black/60 transition-colors hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 size={12} /> この予約を取消
                  </button>
                )}
              </div>
            )}
            {/* 車種選択 */}
            <CarSelector selected={carId} onSelect={selectCar} />

            {/* 予約フォーム */}
            {errors.length > 0 && (
              <ul className="space-y-1 border border-red-500/40 bg-red-500/10 p-2 text-[12px] text-red-600">
                {errors.map((e) => (
                  <li key={e} className="flex items-center gap-1.5">
                    <TriangleAlert size={13} className="shrink-0" /> {e}
                  </li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="氏名 / PILOT">
                {noUsers ? (
                  <div className="flex items-start gap-1.5 border border-amber-500/50 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-700">
                    <TriangleAlert size={13} className="mt-0.5 shrink-0" /> ユーザー名が登録されていません。下の「設定」から登録してください。
                  </div>
                ) : (
                  <select value={userName} onChange={(e) => setUserName(e.target.value)} className="hud-input" required>
                    <option value="" disabled className="bg-white">
                      選択してください
                    </option>
                    {userOptions.map((n) => (
                      <option key={n} value={n} className="bg-white">
                        {n}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="返却場所 / BASE">
                {noLocations ? (
                  <div className="flex items-start gap-1.5 border border-amber-500/50 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-700">
                    <TriangleAlert size={13} className="mt-0.5 shrink-0" /> 返却場所が登録されていません。下の「設定」から登録してください。
                  </div>
                ) : (
                  <select value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)} className="hud-input" required>
                    <option value="" disabled className="bg-white">
                      選択してください
                    </option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc} className="bg-white">
                        {loc}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            {/* 終日トグル */}
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-black/70">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 accent-current"
                style={{ accentColor: car.accent }}
              />
              <span className="font-mono tracking-widest">終日 / ALL DAY</span>
            </label>

            {allDay ? (
              <div className="border border-black/10 bg-black/[0.03] px-3 py-2.5 text-[13px] text-black/60">
                終日（00:00 – 23:59）で予約します
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="利用開始 / DEPARTURE">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStartTime(v);
                      // 返却時刻が開始以下になったら、開始の1時間後に自動更新
                      if (v !== "" && endTime <= v) setEndTime(addOneHour(v));
                    }}
                    className="hud-input"
                    required
                  />
                </Field>
                <Field label="返却時刻 / RETURN">
                  <input
                    type="time"
                    value={endTime}
                    min={startTime || undefined}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="hud-input"
                    required
                  />
                </Field>
              </div>
            )}

            <Field label="メモ / NOTE（任意）">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例: 鍵は受付で受け取り / 給油してから返却"
                rows={2}
                className="hud-input resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="mt-1 flex w-full items-center justify-center gap-2 py-3 text-center text-sm font-bold tracking-[0.3em] transition-all"
              style={
                submitting || !canSubmit
                  ? {
                      background: "#d6dbe2",
                      color: "rgba(0,0,0,0.4)",
                      cursor: "not-allowed",
                      clipPath: "polygon(0 0, 100% 0, 96% 100%, 0 100%)",
                    }
                  : {
                      background: car.accent,
                      color: "#000",
                      boxShadow: `0 0 24px -6px ${car.accent}`,
                      clipPath: "polygon(0 0, 100% 0, 96% 100%, 0 100%)",
                    }
              }
            >
              {submitting ? (
                "PROCESSING..."
              ) : editingId !== null ? (
                <>
                  <Pencil size={15} /> 予約を更新 / UPDATE
                </>
              ) : (
                <>
                  <Check size={16} /> 予約を確定 / DEPLOY
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-[0.25em] text-black/45">{label}</span>
      {children}
    </label>
  );
}
