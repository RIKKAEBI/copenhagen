# copenhagen — 社用車予約

社用車（コペン / バモス）をカレンダーから予約できるアプリ。
[OpenNext](https://opennext.js.org/cloudflare) で **Cloudflare Workers** 上で動作し、データは **Cloudflare D1** に保存します。

## 主な機能

- カレンダーから予約の作成・編集・取消（終日予約・メモ対応）
- 予約スケジュール／車両所在地／操作履歴（アクティビティログ）の表示
- ユーザー名・返却場所の設定
- 日時はすべて日本時間（JST）

## 開発

```bash
mise install
bun install
bun run db:migrate:local   # ローカル D1 を初期化
bun run dev                # http://localhost:3000
```

## デプロイ（Cloudflare Workers Builds）

ダッシュボードの Build 設定:

- Build: `bunx opennextjs-cloudflare build`
- Deploy: `bunx wrangler d1 migrations apply copenhagen --remote && bunx wrangler deploy`

事前に D1 を作成し、`wrangler.jsonc` の `database_id` に実 ID を設定してください。

## スタック

Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / lucide-react / Cloudflare Workers (OpenNext) + D1 / Bun + mise
