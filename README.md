# copenhagen — 社用車予約システム / CAR DEPLOYMENT

社用車（**コペン** / **バモス**）をカレンダーから予約できるアプリです。
排気量・MT/AT・駆動方式などのスペックやパフォーマンスを確認しながら、
氏名・利用時刻・返却場所を指定して予約できます。レスポンシブ対応でスマホからも利用できます。

[OpenNext](https://opennext.js.org/cloudflare) で **Cloudflare Workers** 上で動作し、予約データは **Cloudflare D1** に保存します。

## 機能

- 📅 **カレンダー予約** — 月間カレンダーの日付をクリックすると、その日の予約一覧つきの予約ダイアログが開く。
- 📊 **スペック表示** — 排気量・最高出力・トルク・ミッション（MT/AT）・駆動方式・定員などとパフォーマンスバーを表示。
- 🅿️ **車両所在地** — 各車の使用中／待機中ステータスと現在地を表示。
- 🗂️ **予約スケジュール** — 車ごとの直近予約の表示・取消。同じ車の時間帯重複はサーバ側で弾く。

## スタック

- Next.js 16 (App Router) + React 19 / TypeScript / Tailwind CSS v4
- `@opennextjs/cloudflare` + Wrangler（Cloudflare Workers）
- Cloudflare D1（SQLite）でデータ永続化
- Bun + mise（`.mise.toml`）

## セットアップ

```bash
mise install        # Node 24 + Bun
bun install
```

### ローカル D1 の初期化

```bash
# ローカル DB にマイグレーションを適用（.wrangler/state に SQLite が作られる）
bun run db:migrate:local
```

### 開発

```bash
bun run dev          # http://localhost:3000
```

`next dev` でも `getCloudflareContext()` 経由でローカル D1 バインディング（`DB`）が使えます。

## Cloudflare へのデプロイ

```bash
# 1. 本番 D1 を作成し、出力された database_id を wrangler.jsonc に設定
wrangler d1 create copenhagen

# 2. 本番 D1 にマイグレーション適用
bun run db:migrate

# 3. ビルドしてデプロイ（要 wrangler login）
bun run deploy
```

> `wrangler.jsonc` の `d1_databases[0].database_id` は初期値がダミー（all-zero）です。デプロイ前に実 ID へ置き換えてください。

## 構成

| パス | 役割 |
| --- | --- |
| `src/lib/cars.ts` | コペン／バモスの諸元・スペック・テーマカラー |
| `src/components/HangarApp.tsx` | 画面全体のオーケストレーション（状態管理） |
| `src/components/ReservationDialog.tsx` | 予約ダイアログ（この日の予約一覧＋予約フォーム） |
| `src/components/{CarSelector,ReservationCalendar,ReservationsBoard,VehicleLocations}.tsx` | UI パーツ |
| `src/app/api/reservations/route.ts` | 予約の取得・作成（D1、重複チェック付き） |
| `src/app/api/reservations/[id]/route.ts` | 予約の取消 |
| `migrations/0001_init.sql` | `reservations` テーブル定義 |
| `wrangler.jsonc` | Worker／D1 バインディング設定 |

## メモ

- バインディングを変更したら `bun run cf-typegen` で `cloudflare-env.d.ts` を再生成してください。
