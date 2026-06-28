import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAR DEPLOYMENT // 社用車予約システム",
  description: "コペン・バモスの予約。エースコンバット風の機体選択UIで社用車を予約。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
