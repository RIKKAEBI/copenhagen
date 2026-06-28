export type CarId = "copen" | "vamos";

export type Stat = {
  /** 表示ラベル */
  label: string;
  /** 数値表示（例: "64 PS"） */
  display: string;
  /** バー描画用の 0..1 正規化値 */
  value: number;
};

export type Car = {
  id: CarId;
  /** 機体名のように表示する short code */
  code: string;
  name: string;
  maker: string;
  /** 一言キャッチ */
  tagline: string;
  bodyType: string;
  transmission: string;
  drivetrain: string;
  seats: number;
  /** テーマカラー（HUD アクセント） */
  accent: string;
  accentDim: string;
  /** スペックの詳細（テーブル表示用） */
  specs: { label: string; value: string }[];
  /** レーダー/バー表示用の主要ステータス */
  stats: Stat[];
};

export const CARS: Record<CarId, Car> = {
  copen: {
    id: "copen",
    code: "LA400K",
    name: "コペン",
    maker: "DAIHATSU",
    tagline: "電動オープン 2シーター・ライトウェイト",
    bodyType: "アクティブトップ ロードスター",
    transmission: "CVT / 5MT",
    drivetrain: "FF",
    seats: 2,
    accent: "#ff6a3d",
    accentDim: "#7a2d16",
    specs: [
      { label: "型式", value: "LA400K" },
      { label: "排気量", value: "658 cc" },
      { label: "エンジン", value: "直列3気筒 DOHC インタークーラーターボ" },
      { label: "最高出力", value: "47 kW (64 PS) / 6,400 rpm" },
      { label: "最大トルク", value: "92 N·m (9.4 kgf·m) / 3,200 rpm" },
      { label: "ミッション", value: "CVT または 5速 MT" },
      { label: "駆動方式", value: "FF（前輪駆動）" },
      { label: "乗車定員", value: "2 名" },
      { label: "全長×全幅×全高", value: "3,395 × 1,475 × 1,280 mm" },
      { label: "車両重量", value: "870 kg" },
      { label: "ルーフ", value: "電動開閉式ハードトップ（アクティブトップ）" },
    ],
    stats: [
      { label: "POWER", display: "64 PS", value: 0.62 },
      { label: "TORQUE", display: "92 N·m", value: 0.5 },
      { label: "WEIGHT", display: "870 kg", value: 0.35 },
      { label: "AGILITY", display: "A", value: 0.9 },
      { label: "SEATS", display: "2", value: 0.2 },
    ],
  },
  vamos: {
    id: "vamos",
    code: "HM1",
    name: "バモス",
    maker: "HONDA",
    tagline: "ミッドシップ・キャブオーバー 4シーター・ワークホース",
    bodyType: "キャブオーバー ワンボックス",
    transmission: "4AT / 5MT",
    drivetrain: "MR / 4WD",
    seats: 4,
    accent: "#3da9ff",
    accentDim: "#16466f",
    specs: [
      { label: "型式", value: "HM1 / HM2" },
      { label: "排気量", value: "656 cc" },
      { label: "エンジン", value: "直列3気筒 SOHC（ミッドシップ縦置き）" },
      { label: "最高出力", value: "33 kW (45 PS) / 5,500 rpm" },
      { label: "最大トルク", value: "60 N·m (6.1 kgf·m) / 3,700 rpm" },
      { label: "ミッション", value: "4速 AT または 5速 MT" },
      { label: "駆動方式", value: "MR（後輪駆動）/ 4WD" },
      { label: "乗車定員", value: "4 名" },
      { label: "全長×全幅×全高", value: "3,395 × 1,475 × 1,800 mm" },
      { label: "車両重量", value: "1,000 kg" },
      { label: "特長", value: "広い荷室・フルフラットシートで積載力◎" },
    ],
    stats: [
      { label: "POWER", display: "45 PS", value: 0.42 },
      { label: "TORQUE", display: "60 N·m", value: 0.33 },
      { label: "CARGO", display: "XL", value: 0.92 },
      { label: "AGILITY", display: "B", value: 0.55 },
      { label: "SEATS", display: "4", value: 0.6 },
    ],
  },
};

export const CAR_LIST: Car[] = [CARS.copen, CARS.vamos];

/** 返却場所の候補（社内拠点） */
export const RETURN_LOCATIONS = [
  "本社 第1駐車場",
  "本社 第2駐車場",
  "東棟 地下P",
  "西営業所",
  "倉庫前スペース",
] as const;
