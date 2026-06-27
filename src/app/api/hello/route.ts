import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  // Cloudflare の env / cf / ctx へアクセスできる。
  // env にはバインディング（KV / D1 / R2 など）が入る。
  const { cf } = getCloudflareContext();

  return Response.json({
    message: "Hello from Cloudflare Workers via OpenNext 👋",
    colo: cf?.colo ?? null,
    country: cf?.country ?? null,
    timestamp: new Date().toISOString(),
  });
}
