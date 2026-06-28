# copenhagen — 社用車予約

社用車（**コペン** / **バモス**）をカレンダーから予約できるアプリです。
カレンダーの日付をクリックして、氏名・利用時刻・返却場所・メモを指定して予約します。
レスポンシブ対応でスマホからも利用できます。日時はすべて**日本時間（JST）**で扱います。

[OpenNext](https://opennext.js.org/cloudflare) で **Cloudflare Workers** 上で動作し、
データは **Cloudflare D1** に保存します。

## 機能

- 📅 **カレンダー予約** — 日付クリックで「その日の予約一覧＋予約フォーム」のダイアログを開く。メモはカレンダーに2行まで表示。
- ✏️ **作成・編集・取消** — 一覧の予約をクリックすると右フォームに読み込んで編集／取消。同じ車の時間帯重複はサーバ側で拒否。
- 🌙 **終日予約** — 終日トグルで 00:00–23:59 の予約に対応。
- 🗂️ **予約スケジュール / 車両所在地** — 車ごとの直近予約と、使用中／待機中ステータス・現在地を表示。
- 🧾 **アクティビティログ** — 予約の作成・更新・取消をすべて記録（ページング付き）。取消した予約も履歴に残る。
- ⚙️ **設定** — ユーザー名・返却場所を登録／編集／削除（予約・履歴で使用中の値は削除不可・リネームは可）。
- 🕘 **JST固定** — 表示・保存・判定をすべて Asia/Tokyo 基準にそろえ、実行環境のタイムゾーンに依存しない。

## スタック

- Next.js 16 (App Router) + React 19 / TypeScript / Tailwind CSS v4
- lucide-react（アイコン）
- `@opennextjs/cloudflare` + Wrangler（Cloudflare Workers）
- Cloudflare D1（SQLite）でデータ永続化
- Bun + mise（`.mise.toml`）

## セットアップ

```bash
mise install        # Node + Bun
bun install
bun run db:migrate:local   # ローカル D1 にマイグレーション適用
bun run dev                # http://localhost:3000
```

`next dev` でも `getCloudflareContext()` 経由でローカル D1 バインディング（`DB`）が使えます。

## Cloudflare へのデプロイ

GitHub 連携（Workers Builds）でのデプロイを推奨します。ダッシュボードの Build 設定:

| 項目 | コマンド |
| --- | --- |
| Build command | `bunx opennextjs-cloudflare build` |
| Deploy command（本番） | `bunx wrangler d1 migrations apply copenhagen --remote && bunx wrangler deploy` |
| Deploy command（非本番） | `bunx wrangler versions upload` |

- 事前に D1 を作成し（ダッシュボード or `wrangler d1 create copenhagen`）、`wrangler.jsonc` の `d1_databases[0].database_id` に実 ID を設定する。
- マイグレーションはデプロイコマンドに連結（未適用分のみ適用＝冪等。データは消えない）。
- 手動デプロイする場合は `bun run deploy`（`opennextjs-cloudflare build && deploy`、要 `wrangler login`）。

## 構成

| パス | 役割 |
| --- | --- |
| `src/lib/cars.ts` | コペン／バモスの諸元・スペック・テーマカラー |
| `src/lib/datetime.ts` | 日時を JST で扱う共通ユーティリティ |
| `src/lib/types.ts` / `src/lib/activity.ts` | 型定義・操作ログ記録ヘルパー |
| `src/components/HangarApp.tsx` | 画面全体のオーケストレーション（状態管理） |
| `src/components/ReservationDialog.tsx` | 予約ダイアログ（一覧＋作成／編集フォーム） |
| `src/components/{ReservationCalendar,ReservationsBoard,VehicleLocations,ActivityLog,SettingsPanel,CarSelector}.tsx` | UI パーツ |
| `src/app/api/reservations/**` | 予約の取得・作成・更新・取消（D1、重複チェック付き） |
| `src/app/api/activity/route.ts` | アクティビティログ取得（ページング） |
| `src/app/api/settings/**` | ユーザー名・返却場所の設定 |
| `migrations/*.sql` | D1 スキーマ（予約・ログ・設定・メモ列） |
| `wrangler.jsonc` | Worker／D1 バインディング設定 |

## メモ

- バインディングを変更したら `bun run cf-typegen` で `cloudflare-env.d.ts` を再生成してください。
