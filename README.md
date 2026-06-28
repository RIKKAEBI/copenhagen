# copenhagen — 社用車予約システム / CAR DEPLOYMENT

エースコンバットの機体選択画面のような UI で社用車（**コペン** / **バモス**）を予約できるアプリです。
3D モデルがターンテーブル上で回転し、排気量・MT/AT・駆動方式などのスペックを確認しながら、
氏名・利用日時・返却場所を指定して予約できます。

[OpenNext](https://opennext.js.org/cloudflare) で **Cloudflare Workers** 上で動作し、予約データは **Cloudflare D1** に保存します。

## 機能

- 🚗 **3D 機体選択 UI** — React Three Fiber によるコペン（オープン2シーター）／バモス（キャブオーバー1BOX）の回転モデル。ドラッグで回転。
- 📊 **スペック表示** — 排気量・最高出力・トルク・ミッション（MT/AT）・駆動方式・定員などを HUD 風に表示。
- 📅 **予約** — 氏名・利用開始／返却日時・返却場所を登録。同じ車の時間帯重複はサーバ側で弾く。
- 🗂️ **予約スケジュール** — 有効な予約の一覧表示・取消。

## スタック

- Next.js 16 (App Router) + React 19 / TypeScript / Tailwind CSS v4
- three / @react-three/fiber / @react-three/drei（3D）
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
| `src/components/CarModel.tsx` | 車種ごとの手続き的 3D モデル |
| `src/components/CarShowcase.tsx` | Canvas・ライティング・ターンテーブル・HUD リング |
| `src/components/HangarApp.tsx` | 画面全体のオーケストレーション（状態管理） |
| `src/components/{SpecPanel,CarSelector,ReservationForm,ReservationsBoard}.tsx` | UI パーツ |
| `src/app/api/reservations/route.ts` | 予約の取得・作成（D1、重複チェック付き） |
| `src/app/api/reservations/[id]/route.ts` | 予約の取消 |
| `migrations/0001_init.sql` | `reservations` テーブル定義 |
| `wrangler.jsonc` | Worker／D1 バインディング設定 |

## メモ

- バインディングを変更したら `bun run cf-typegen` で `cloudflare-env.d.ts` を再生成してください。
- 3D は WebGL のためクライアント専用（`next/dynamic` の `ssr:false`）で読み込んでいます。
