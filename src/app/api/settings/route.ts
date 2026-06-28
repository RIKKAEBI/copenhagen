import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

type SettingRow = { id: number; kind: string; value: string };

function getDb() {
  const { env } = getCloudflareContext();
  return (env as { DB?: D1Database }).DB;
}

export async function GET() {
  const db = getDb();
  if (!db) return Response.json({ users: [], locations: [] });

  const { results } = await db
    .prepare("SELECT id, kind, value FROM settings ORDER BY value ASC")
    .all<SettingRow>();

  // 予約・アクティビティログのどちらかで使われている値（削除不可の判定用）
  const [resv, acts] = await Promise.all([
    db.prepare("SELECT user_name, return_location FROM reservations").all<{ user_name: string; return_location: string }>(),
    db.prepare("SELECT user_name, return_location FROM activity_log").all<{ user_name: string; return_location: string }>(),
  ]);
  const rows = [...resv.results, ...acts.results];
  const usedUsers = new Set(rows.map((r) => r.user_name));
  const usedLocations = new Set(rows.map((r) => r.return_location));

  return Response.json({
    users: results
      .filter((r) => r.kind === "user")
      .map((r) => ({ id: r.id, value: r.value, inUse: usedUsers.has(r.value) })),
    locations: results
      .filter((r) => r.kind === "location")
      .map((r) => ({ id: r.id, value: r.value, inUse: usedLocations.has(r.value) })),
  });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return Response.json({ error: "D1 binding (DB) が未設定です。" }, { status: 503 });

  let body: { kind?: string; value?: string };
  try {
    body = (await request.json()) as { kind?: string; value?: string };
  } catch {
    return Response.json({ error: "JSON ボディが不正です。" }, { status: 400 });
  }

  const kind = body.kind;
  const value = body.value?.trim();
  if (kind !== "user" && kind !== "location") {
    return Response.json({ error: "kind が不正です。" }, { status: 400 });
  }
  if (!value) {
    return Response.json({ error: "値を入力してください。" }, { status: 400 });
  }

  await db.prepare("INSERT OR IGNORE INTO settings (kind, value) VALUES (?1, ?2)").bind(kind, value).run();
  const row = await db
    .prepare("SELECT id, kind, value FROM settings WHERE kind = ?1 AND value = ?2")
    .bind(kind, value)
    .first<SettingRow>();

  return Response.json({ item: row }, { status: 201 });
}
