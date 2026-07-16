import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaTeX Studio",
  description:
    "LaTeX数式をライブプレビューし、透過PNG / SVG / PDFで書き出せる個人用ツール",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
