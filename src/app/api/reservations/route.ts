import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CARS, type CarId } from "@/lib/cars";
import { rowToReservation, type ReservationRow } from "@/lib/types";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

function getDb() {
  const { env } = getCloudflareContext();
  return (env as { DB?: D1Database }).DB;
}

export async function GET() {
  const db = getDb();
  if (!db) {
    return Response.json(
      { reservations: [], warning: "D1 binding (DB) が未設定です。READMEのセットアップを参照してください。" },
      { status: 200 },
    );
  }

  const { results } = await db
    .prepare("SELECT * FROM reservations ORDER BY start_at ASC")
    .all<ReservationRow>();

  return Response.json({ reservations: results.map(rowToReservation) });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return Response.json(
      { error: "D1 binding (DB) が未設定のため保存できません。READMEのセットアップを参照してください。" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON ボディが不正です。" }, { status: 400 });
  }

  const { userName, carId, startAt, endAt, returnLocation, memo } = (body ?? {}) as Record<string, string>;

  // バリデーション
  const errors: string[] = [];
  if (!userName?.trim()) errors.push("名前を入力してください。");
  if (!carId || !(carId in CARS)) errors.push("車を選択してください。");
  if (!startAt || Number.isNaN(Date.parse(startAt))) errors.push("利用開始日時が不正です。");
  if (!endAt || Number.isNaN(Date.parse(endAt))) errors.push("返却日時が不正です。");
  if (startAt && endAt && Date.parse(endAt) <= Date.parse(startAt))
    errors.push("返却日時は利用開始日時より後にしてください。");
  if (!returnLocation?.trim()) errors.push("返却場所を選択してください。");
  if (errors.length) return Response.json({ errors }, { status: 400 });

  // 同じ車の時間帯重複チェック
  const overlap = await db
    .prepare(
      "SELECT COUNT(*) AS n FROM reservations WHERE car_id = ?1 AND start_at < ?3 AND end_at > ?2",
    )
    .bind(carId, startAt, endAt)
    .first<{ n: number }>();

  if (overlap && overlap.n > 0) {
    return Response.json(
      { errors: [`${CARS[carId as CarId].name} はその時間帯にすでに予約があります。`] },
      { status: 409 },
    );
  }

  const inserted = await db
    .prepare(
      `INSERT INTO reservations (user_name, car_id, start_at, end_at, return_location, memo)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)
       RETURNING *`,
    )
    .bind(userName.trim(), carId, startAt, endAt, returnLocation, (memo ?? "").trim())
    .first<ReservationRow>();

  await logActivity(db, {
    action: "create",
    carId: carId as CarId,
    userName: userName.trim(),
    startAt,
    endAt,
    returnLocation,
  });

  return Response.json({ reservation: inserted ? rowToReservation(inserted) : null }, { status: 201 });
}
