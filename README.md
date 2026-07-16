# LaTeX Studio

LaTeX数式をライブプレビューしながら作成し、高画質の背景透過PNG / SVG / PDFで書き出せる個人用Webアプリ。

## 機能

- **ライブプレビュー**: MathJax v3 (SVG出力) による即時レンダリング。physics / color / cancel / mhchem 拡張対応
- **エクスポート**
  - 背景透過PNG(解像度 2x / 4x / 8x / 16x)
  - SVG(自己完結・色焼き込み済み)
  - ベクターPDF
  - PNGクリップボードコピー
- **履歴**: 保存した数式を Supabase (Postgres) に記録。クリックで再編集、どの端末からでもアクセス可能
- **認証**: Google OAuth (Supabase Auth)。履歴は自分だけが閲覧可能 (RLS)

## 技術スタック

| 層 | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router, TypeScript) |
| 数式レンダリング | MathJax v3 `tex-svg-full` |
| PDF生成 | jspdf + svg2pdf.js |
| DB / 認証 | Supabase (Postgres + Google OAuth) |
| ホスティング | Vercel |

## セットアップ

[docs/SETUP.md](docs/SETUP.md) を参照(Supabase / Google OAuth / Vercel の設定手順)。

ローカルでは:

```bash
npm install
cp .env.example .env.local  # Supabase の URL / anonキーを記入
npm run dev
```

Supabase 未設定でもエディタとエクスポートは動作する(履歴のみ無効)。

## ディレクトリ構成

```
app/
  page.tsx              # メイン画面
  auth/callback/        # OAuth コールバック
components/
  EquationEditor.tsx    # エディタ + プレビュー + エクスポート
  HistoryPanel.tsx      # 履歴サイドバー
  AuthButton.tsx        # ログイン/ログアウト
lib/
  mathjax.ts            # MathJax ローダ / レンダリング
  export.ts             # PNG / SVG / PDF エクスポート
  db.ts                 # equations テーブル CRUD
  supabase/client.ts    # Supabase ブラウザクライアント
supabase/schema.sql     # DBスキーマ + RLS
```
