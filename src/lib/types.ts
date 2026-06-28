import type { CarId } from "./cars";

export type Reservation = {
  id: number;
  userName: string;
  carId: CarId;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  returnLocation: string;
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
  created_at: string;
};

export function rowToReservation(r: ReservationRow): Reservation {
  return {
    id: r.id,
    userName: r.user_name,
    carId: r.car_id,
    startAt: r.start_at,
    endAt: r.end_at,
    returnLocation: r.return_location,
    createdAt: r.created_at,
  };
}
