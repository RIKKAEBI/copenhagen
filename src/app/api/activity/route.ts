import { getCloudflareContext } from "@opennextjs/cloudflare";
import { rowToActivity, type ActivityRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { env } = getCloudflareContext();
  const db = (env as { DB?: D1Database }).DB;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 10));

  if (!db) {
    return Response.json({ activities: [], total: 0, page, pageSize });
  }

  const totalRow = await db.prepare("SELECT COUNT(*) AS n FROM activity_log").first<{ n: number }>();
  const total = totalRow?.n ?? 0;

  const { results } = await db
    .prepare("SELECT * FROM activity_log ORDER BY id DESC LIMIT ?1 OFFSET ?2")
    .bind(pageSize, (page - 1) * pageSize)
    .all<ActivityRow>();

  return Response.json({ activities: results.map(rowToActivity), total, page, pageSize });
}
