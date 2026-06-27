import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// OpenNext / Cloudflare: `next dev` 中に getCloudflareContext() でローカルバインディングを使えるようにする
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
