# セットアップ手順

Vercel(ホスティング)+ Supabase(DB / Google認証)で LaTeX Studio を動かすまでの手順。所要時間は約20〜30分。

## 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) にサインアップ(無料プランでOK)
2. **New project** → プロジェクト名(例: `latex-studio`)、DBパスワード、リージョン(Tokyo: `ap-northeast-1`)を設定して作成
3. 作成後、**Project Settings → API** を開き、以下を控える
   - `Project URL`(例: `https://abcdefgh.supabase.co`)
   - `anon` `public` キー

## 2. DBスキーマ作成

1. Supabase ダッシュボード左メニュー → **SQL Editor**
2. このリポジトリの [`supabase/schema.sql`](../supabase/schema.sql) の内容を貼り付けて **Run**
3. `equations` テーブルが作成され、RLS(自分の行のみ読み書き可)が有効になる

## 3. Google OAuth クライアント作成

1. [Google Cloud Console](https://console.cloud.google.com/) → プロジェクトを作成(または既存を選択)
2. **APIとサービス → OAuth 同意画面**
   - User Type: **外部**、アプリ名等を入力(テストユーザーに自分のGmailを追加)
3. **APIとサービス → 認証情報 → 認証情報を作成 → OAuth クライアント ID**
   - アプリケーションの種類: **ウェブアプリケーション**
   - **承認済みのリダイレクト URI** に以下を追加:
     ```
     https://<プロジェクトRef>.supabase.co/auth/v1/callback
     ```
     (`<プロジェクトRef>` は手順1のProject URLのサブドメイン部分)
4. 発行された **クライアントID** と **クライアントシークレット** を控える

## 4. Supabase に Google 認証を設定

1. Supabase ダッシュボード → **Authentication → Sign In / Up → Google** を有効化
2. 手順3のクライアントIDとシークレットを入力して保存
3. **Authentication → URL Configuration** で以下を設定
   - **Site URL**: 本番URL(例: `https://latex-studio.vercel.app`)
   - **Redirect URLs** に追加:
     ```
     http://localhost:3000/auth/callback
     https://<あなたのVercelドメイン>/auth/callback
     ```

## 5. ローカル開発

```bash
git clone https://github.com/RentoYabuki06/latex_formula_wep_app.git
cd latex_formula_wep_app
npm install
cp .env.example .env.local   # 手順1の URL / anonキーを記入
npm run dev                  # http://localhost:3000
```

## 6. Vercel デプロイ

1. [vercel.com](https://vercel.com) にGitHubでサインアップ
2. **Add New → Project** → このリポジトリをインポート(Framework: Next.js が自動検出される)
3. **Environment Variables** に以下を設定:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | 手順1の Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 手順1の anon キー |
4. **Deploy** → 発行されたドメインを手順4の Site URL / Redirect URLs に反映

以降は main ブランチへの push で自動デプロイされる。

## トラブルシューティング

- **ログイン後にリダイレクトが失敗する** → Supabase の Redirect URLs に `https://<ドメイン>/auth/callback` が入っているか確認
- **`redirect_uri_mismatch`** → Google Cloud 側のリダイレクト URI が `https://<プロジェクトRef>.supabase.co/auth/v1/callback` と一致しているか確認
- **履歴が保存できない** → SQL Editor で `schema.sql` を実行済みか、RLSポリシーが4つ作成されているか確認
- **「Supabase未設定」と表示される** → 環境変数2つが設定されているか確認(Vercelでは設定後に再デプロイが必要)

## セキュリティメモ

- `anon` キーは公開前提のキー(RLSがアクセス制御を担う)。`service_role` キーは絶対にクライアントや環境変数 `NEXT_PUBLIC_*` に入れないこと
- 個人利用でも OAuth 同意画面を「テスト」のままにしておけば、テストユーザー以外はログイン不可
