import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logActivity } from "@/lib/activity";
import { CARS, type CarId } from "@/lib/cars";
import { rowToReservation, type ReservationRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return Response.json({ error: "id が不正です。" }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const db = (env as { DB?: D1Database }).DB;
  if (!db) return Response.json({ error: "D1 binding (DB) が未設定です。" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON ボディが不正です。" }, { status: 400 });
  }
  const { userName, carId, startAt, endAt, returnLocation, memo } = (body ?? {}) as Record<string, string>;

  const errors: string[] = [];
  if (!userName?.trim()) errors.push("名前を選択してください。");
  if (!carId || !(carId in CARS)) errors.push("車を選択してください。");
  if (!startAt || Number.isNaN(Date.parse(startAt))) errors.push("利用開始日時が不正です。");
  if (!endAt || Number.isNaN(Date.parse(endAt))) errors.push("返却日時が不正です。");
  if (startAt && endAt && Date.parse(endAt) <= Date.parse(startAt))
    errors.push("返却日時は利用開始日時より後にしてください。");
  if (!returnLocation?.trim()) errors.push("返却場所を選択してください。");
  if (errors.length) return Response.json({ errors }, { status: 400 });

  // 自分以外の同じ車の時間帯重複チェック
  const overlap = await db
    .prepare("SELECT COUNT(*) AS n FROM reservations WHERE car_id = ?1 AND start_at < ?3 AND end_at > ?2 AND id != ?4")
    .bind(carId, startAt, endAt, numId)
    .first<{ n: number }>();
  if (overlap && overlap.n > 0) {
    return Response.json(
      { errors: [`${CARS[carId as CarId].name} はその時間帯にすでに予約があります。`] },
      { status: 409 },
    );
  }

  const updated = await db
    .prepare(
      `UPDATE reservations SET user_name = ?2, car_id = ?3, start_at = ?4, end_at = ?5, return_location = ?6, memo = ?7
       WHERE id = ?1
       RETURNING *`,
    )
    .bind(numId, userName.trim(), carId, startAt, endAt, returnLocation, (memo ?? "").trim())
    .first<ReservationRow>();

  if (!updated) return Response.json({ error: "対象の予約が見つかりません。" }, { status: 404 });

  await logActivity(db, {
    action: "update",
    carId: carId as CarId,
    userName: userName.trim(),
    startAt,
    endAt,
    returnLocation,
  });

  return Response.json({ reservation: rowToReservation(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return Response.json({ error: "id が不正です。" }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const db = (env as { DB?: D1Database }).DB;
  if (!db) {
    return Response.json({ error: "D1 binding (DB) が未設定です。" }, { status: 503 });
  }

  // 取消ログ用に削除前の内容を取得
  const row = await db.prepare("SELECT * FROM reservations WHERE id = ?1").bind(numId).first<ReservationRow>();
  const res = await db.prepare("DELETE FROM reservations WHERE id = ?1").bind(numId).run();

  if (row) {
    await logActivity(db, {
      action: "cancel",
      carId: row.car_id,
      userName: row.user_name,
      startAt: row.start_at,
      endAt: row.end_at,
      returnLocation: row.return_location,
    });
  }

  return Response.json({ deleted: res.meta.changes ?? 0 });
}
