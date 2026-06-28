import type { CarId } from "./cars";
import { hourMinuteJst } from "./datetime";

export type Reservation = {
  id: number;
  userName: string;
  carId: CarId;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  returnLocation: string;
  memo: string;
  createdAt: string;
};

export type NewReservation = Omit<Reservation, "id" | "createdAt">;

/** D1 の行（snake_case）→ アプリ型（camelCase） */
export type ReservationRow = {
  id: number;
  user_name: string;
  car_id: CarId;
  start_at: string;
  end_at: string;
  return_location: string;
  memo: string;
  created_at: string;
};

export type ActivityAction = "create" | "cancel" | "update";

export type Activity = {
  id: number;
  action: ActivityAction;
  carId: CarId;
  userName: string;
  startAt: string;
  endAt: string;
  returnLocation: string;
  at: string; // 操作日時 ISO
};

export type ActivityRow = {
  id: number;
  action: ActivityAction;
  car_id: CarId;
  user_name: string;
  start_at: string;
  end_at: string;
  return_location: string;
  at: string;
};

export function rowToActivity(r: ActivityRow): Activity {
  return {
    id: r.id,
    action: r.action,
    carId: r.car_id,
    userName: r.user_name,
    startAt: r.start_at,
    endAt: r.end_at,
    returnLocation: r.return_location,
    at: r.at,
  };
}

/** 終日予約か（JST で 00:00–23:59 に一致するか）を判定する */
export function isAllDay(r: { startAt: string; endAt: string }): boolean {
  const s = hourMinuteJst(r.startAt);
  const e = hourMinuteJst(r.endAt);
  return s.h === 0 && s.m === 0 && e.h === 23 && e.m === 59;
}

export function rowToReservation(r: ReservationRow): Reservation {
  return {
    id: r.id,
    userName: r.user_name,
    carId: r.car_id,
    startAt: r.start_at,
    endAt: r.end_at,
    returnLocation: r.return_location,
    memo: r.memo ?? "",
    createdAt: r.created_at,
  };
}
