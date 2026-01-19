---
name: nextjs-family-app-starter
description: Next.js 16 + Vercel + Turso + Better Auth (Google認証) のフルスタックアプリ初期セットアップ。家族向けの小規模アプリを素早く構築するためのスターターキット。「新しいアプリを作りたい」「Next.jsプロジェクトを始めたい」「認証付きアプリを作りたい」「家族用アプリを作りたい」などのリクエストで使用。
---

# Next.js Family App Starter

家族向けアプリを素早く構築するための初期セットアップスキル。

## 技術スタック (2026年1月時点)

- **Next.js 16.1** (App Router, React 19, Turbopack標準)
- **Turso** (libSQL - SQLite互換の分散DB)
- **Drizzle ORM 1.0** (型安全なORM)
- **Better Auth 1.4+** (Google認証、Auth.jsチーム合流後)
- **Tailwind CSS v4.1** + **shadcn/ui**
- **pnpm** (高速パッケージマネージャー)

## 主な変更点 (2025-2026)

- Next.js 16: `middleware.ts` → `proxy.ts` に名称変更
- Next.js 16: Turbopackがデフォルトバンドラーに
- Next.js 16: Cache Components と `use cache` ディレクティブ
- Tailwind v4: CSS-firstの設定（`tailwind.config.js`不要）
- Tailwind v4: `@import "tailwindcss"` のみでOK
- Better Auth: Auth.jsチームが合流、ESM Only
- Drizzle: v1.0 beta、RQBv2、MSSQL対応

## セットアップ手順

### 1. プロジェクト作成

```bash
pnpm create next-app@latest [app-name] --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd [app-name]
```

### 2. 依存パッケージのインストール

```bash
# データベース関連
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit

# 認証関連
pnpm add better-auth

# UI関連
pnpm add lucide-react
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label
```

### 3. 環境変数の設定

`.env.local` を作成:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://[db-name]-[username].turso.io
TURSO_AUTH_TOKEN=

# Better Auth
BETTER_AUTH_SECRET=  # openssl rand -base64 32 で生成
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 4. ファイル構成

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      # Better Auth APIルート
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # ログインページ
│   ├── (protected)/
│   │   ├── layout.tsx            # 認証必須レイアウト
│   │   └── dashboard/
│   │       └── page.tsx          # ダッシュボード
│   ├── layout.tsx
│   └── page.tsx
├── proxy.ts                       # Next.js 16: 旧middleware.ts
├── lib/
│   ├── auth.ts                   # Better Auth設定
│   ├── auth-client.ts            # クライアント用認証
│   └── db/
│       ├── index.ts              # Drizzle client
│       └── schema.ts             # DBスキーマ
└── components/
    └── auth/
        └── sign-in-button.tsx    # サインインボタン
```

### 5. 主要ファイルの実装

詳細な実装コードは以下を参照:
- **データベース設定**: [references/database.md](references/database.md)
- **認証設定**: [references/auth.md](references/auth.md)
- **UIコンポーネント**: [references/components.md](references/components.md)

### 6. データベースのマイグレーション

```bash
# マイグレーションファイル生成
pnpm drizzle-kit generate

# データベースに適用
pnpm drizzle-kit push
```

### 7. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. OAuth同意画面を設定（外部、テストユーザーに家族を追加）
3. 認証情報 → OAuth 2.0 クライアントIDを作成
4. 承認済みリダイレクトURI: `http://localhost:3000/api/auth/callback/google`
5. 本番用に `https://[your-domain]/api/auth/callback/google` も追加

### 8. Turso設定

```bash
# Turso CLIインストール（初回のみ）
curl -sSfL https://get.tur.so/install.sh | bash

# ログイン
turso auth login

# データベース作成
turso db create [app-name]

# 接続情報取得
turso db show [app-name] --url
turso db tokens create [app-name]
```

### 9. Vercelデプロイ

```bash
vercel
```

環境変数をVercelダッシュボードで設定し、`BETTER_AUTH_URL`を本番URLに更新。

## 許可ユーザーの制限（家族のみ）

`src/lib/auth.ts` の `allowedEmails` に家族のGmailを追加することで、指定したユーザーのみログイン可能に制限。

## package.jsonスクリプト

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**注意**: Next.js 16ではTurbopackがデフォルトなので `--turbopack` フラグは不要。
