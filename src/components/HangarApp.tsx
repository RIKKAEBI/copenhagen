"use client";

import { useEffect, useState } from "react";
import { CARS, type CarId } from "@/lib/cars";
import type { Reservation } from "@/lib/types";
import { ReservationsBoard } from "./ReservationsBoard";
import { ReservationCalendar } from "./ReservationCalendar";
import { ReservationDialog } from "./ReservationDialog";
import { VehicleLocations } from "./VehicleLocations";
import { ActivityLog } from "./ActivityLog";
import { SettingsPanel } from "./SettingsPanel";
import { TriangleAlert } from "lucide-react";

export function HangarApp() {
  const [selected, setSelected] = useState<CarId>("copen");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<Date | undefined>(undefined);
  const [warning, setWarning] = useState<string | null>(null);
  const [activityVersion, setActivityVersion] = useState(0);
  const [userNames, setUserNames] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const car = CARS[selected];

  function openDialog(date?: Date) {
    setDialogDate(date);
    setDialogOpen(true);
  }

  function refreshSettings() {
    fetch("/api/settings")
      .then((r) => r.json() as Promise<{ users: { value: string }[]; locations: { value: string }[] }>)
      .then((d) => {
        setUserNames((d.users ?? []).map((u) => u.value));
        setLocations((d.locations ?? []).map((l) => l.value));
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => r.json() as Promise<{ reservations: Reservation[]; warning?: string }>)
      .then((d) => {
        setReservations(d.reservations ?? []);
        if (d.warning) setWarning(d.warning);
      })
      .catch(() => setWarning("予約データの取得に失敗しました。"));
    refreshSettings();
  }, []);

  async function cancel(id: number) {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/reservations/${id}`, { method: "DELETE" }).catch(() => {});
    setActivityVersion((v) => v + 1);
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-black">
      <div className="scanlines pointer-events-none fixed inset-0 z-0" />

      {warning && (
        <div className="relative z-10 flex items-center justify-center gap-1.5 border-b border-amber-500/40 bg-amber-400/15 px-4 py-2 text-center font-mono text-[11px] text-amber-700 sm:px-6">
          <TriangleAlert size={13} /> {warning}
        </div>
      )}

      {/* 予約スケジュール + 車両所在地（横並び）— カレンダーの上 */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 pt-4 sm:px-6 lg:grid-cols-2">
        <ReservationsBoard reservations={reservations} onCancel={cancel} />
        <VehicleLocations reservations={reservations} />
      </section>

      {/* 予約カレンダー */}
      <section className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6">
        <ReservationCalendar reservations={reservations} accent={car.accent} onSelectDate={openDialog} />
      </section>

      {/* 設定（ユーザー名・返却場所） */}
      <section className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6">
        <SettingsPanel onChanged={refreshSettings} refreshKey={activityVersion} />
      </section>

      {/* アクティビティログ（全DB操作） */}
      <section className="relative z-10 mx-auto max-w-7xl px-3 pb-8 sm:px-6">
        <ActivityLog refreshKey={activityVersion} />
      </section>

      {dialogOpen && (
        <ReservationDialog
          date={dialogDate}
          initialCar={selected}
          reservations={reservations}
          userNames={userNames}
          locations={locations}
          onCarChange={setSelected}
          onCancel={cancel}
          onClose={() => setDialogOpen(false)}
          onCreated={(r) => {
            setReservations((prev) => [...prev, r]);
            setDialogOpen(false);
            setActivityVersion((v) => v + 1);
          }}
          onUpdated={(r) => {
            setReservations((prev) => prev.map((x) => (x.id === r.id ? r : x)));
            setDialogOpen(false);
            setActivityVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}
