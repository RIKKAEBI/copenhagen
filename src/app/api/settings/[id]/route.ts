import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

/** 設定値のリネーム。予約・アクティビティログの該当値も合わせて更新して整合性を保つ。 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return Response.json({ error: "id が不正です。" }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const db = (env as { DB?: D1Database }).DB;
  if (!db) return Response.json({ error: "D1 binding (DB) が未設定です。" }, { status: 503 });

  let body: { value?: string };
  try {
    body = (await request.json()) as { value?: string };
  } catch {
    return Response.json({ error: "JSON ボディが不正です。" }, { status: 400 });
  }
  const newValue = body.value?.trim();
  if (!newValue) return Response.json({ error: "値を入力してください。" }, { status: 400 });

  const row = await db
    .prepare("SELECT kind, value FROM settings WHERE id = ?1")
    .bind(numId)
    .first<{ kind: string; value: string }>();
  if (!row) return Response.json({ error: "対象が見つかりません。" }, { status: 404 });

  if (newValue === row.value) {
    return Response.json({ item: { id: numId, kind: row.kind, value: newValue } });
  }

  // 同じ種別に同名がすでにある場合は拒否
  const dup = await db
    .prepare("SELECT id FROM settings WHERE kind = ?1 AND value = ?2")
    .bind(row.kind, newValue)
    .first<{ id: number }>();
  if (dup) {
    return Response.json({ error: `「${newValue}」は既に登録されています。` }, { status: 409 });
  }

  const column = row.kind === "location" ? "return_location" : "user_name";
  await db.batch([
    db.prepare("UPDATE settings SET value = ?2 WHERE id = ?1").bind(numId, newValue),
    db.prepare(`UPDATE reservations SET ${column} = ?2 WHERE ${column} = ?1`).bind(row.value, newValue),
    db.prepare(`UPDATE activity_log SET ${column} = ?2 WHERE ${column} = ?1`).bind(row.value, newValue),
  ]);

  return Response.json({ item: { id: numId, kind: row.kind, value: newValue } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return Response.json({ error: "id が不正です。" }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const db = (env as { DB?: D1Database }).DB;
  if (!db) return Response.json({ error: "D1 binding (DB) が未設定です。" }, { status: 503 });

  const row = await db
    .prepare("SELECT kind, value FROM settings WHERE id = ?1")
    .bind(numId)
    .first<{ kind: string; value: string }>();
  if (!row) return Response.json({ deleted: 0 });

  // 予約・アクティビティログのどちらかで使われている値は削除不可（誤情報の表示を防ぐ）
  const column = row.kind === "location" ? "return_location" : "user_name";
  const [usedR, usedA] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM reservations WHERE ${column} = ?1`).bind(row.value).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) AS n FROM activity_log WHERE ${column} = ?1`).bind(row.value).first<{ n: number }>(),
  ]);
  if ((usedR?.n ?? 0) + (usedA?.n ?? 0) > 0) {
    return Response.json(
      { error: `「${row.value}」は予約・操作履歴で使用されているため削除できません。` },
      { status: 409 },
    );
  }

  const res = await db.prepare("DELETE FROM settings WHERE id = ?1").bind(numId).run();
  return Response.json({ deleted: res.meta.changes ?? 0 });
}
