import type { CarId } from "./cars";
import type { ActivityAction } from "./types";

export type ActivityInput = {
  action: ActivityAction;
  carId: CarId;
  userName: string;
  startAt: string;
  endAt: string;
  returnLocation: string;
};

/** activity_log に1件記録する（DBが無い場合は何もしない） */
export async function logActivity(db: D1Database, e: ActivityInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO activity_log (action, car_id, user_name, start_at, end_at, return_location)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(e.action, e.carId, e.userName, e.startAt, e.endAt, e.returnLocation)
    .run();
}
