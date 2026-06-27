import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // インクリメンタルキャッシュ等を使う場合はここで設定する。
  // 例: R2 を使う場合
  // incrementalCache: r2IncrementalCache,
});
