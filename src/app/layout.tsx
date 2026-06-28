import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "社用車予約",
  description: "社用車の予約システム",
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
