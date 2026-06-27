# copenhagen

Next.js (App Router) を [OpenNext](https://opennext.js.org/cloudflare) で **Cloudflare Workers** 上にデプロイする最小スターターです。
パッケージ／ランタイムは **Bun**、ツールバージョンは **mise** で管理します。

## スタック

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- `@opennextjs/cloudflare`（Cloudflare Workers 用アダプタ）+ Wrangler
- Bun（パッケージマネージャ／ランタイム）, mise（`.mise.toml`）

## セットアップ

```bash
# Node 24 と Bun を mise で用意
mise install

# 依存関係のインストール
bun install
```

## 開発

```bash
bun run dev          # http://localhost:3000 で Next.js dev サーバ
bun run cf-typegen   # wrangler.jsonc のバインディングから型を生成
```

## Cloudflare 上での動作確認（ローカル）

```bash
bun run preview      # opennextjs-cloudflare build → workerd でローカル実行
```

## デプロイ

> 事前に Cloudflare アカウントの認証が必要です（`wrangler login`）。

```bash
bun run deploy       # ビルドして Cloudflare Workers へデプロイ
```

## 構成

| ファイル | 役割 |
| --- | --- |
| `wrangler.jsonc` | Worker 名・互換性フラグ・アセット・バインディング設定 |
| `open-next.config.ts` | OpenNext（Cloudflare アダプタ）の設定 |
| `next.config.ts` | Next.js 設定 + `initOpenNextCloudflareForDev()` |
| `.mise.toml` | Node / Bun のバージョン固定 |
| `src/app/` | App Router（ページ・レイアウト・API ルート） |
| `src/app/api/hello/route.ts` | `getCloudflareContext()` の使用例 |

## メモ

- `wrangler.jsonc` の `nodejs_compat` フラグと互換性日付は OpenNext が必須とします。
- KV / D1 / R2 などのバインディングは `wrangler.jsonc` に追記し、`bun run cf-typegen` で型を再生成してください。
