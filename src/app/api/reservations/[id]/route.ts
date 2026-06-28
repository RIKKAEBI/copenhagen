import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

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

  const res = await db.prepare("DELETE FROM reservations WHERE id = ?1").bind(numId).run();
  return Response.json({ deleted: res.meta.changes ?? 0 });
}
