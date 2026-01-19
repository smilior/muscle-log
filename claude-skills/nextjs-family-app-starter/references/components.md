# UIコンポーネント (2026年1月)

## Tailwind CSS v4 セットアップ

`src/app/globals.css`:

```css
@import "tailwindcss";

/* Tailwind v4: CSS-first設定 */
@theme {
  --font-sans: "Inter", sans-serif;
  
  /* カスタムカラー（必要に応じて） */
  --color-primary: oklch(0.7 0.15 250);
}
```

**注意**: Tailwind v4では `tailwind.config.js` は不要。すべてCSS内で設定。

## サインインボタン

`src/components/auth/sign-in-button.tsx`:

```typescript
"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2 } from "lucide-react";

export function SignInButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 size-4 animate-spin" />
        読み込み中...
      </Button>
    );
  }

  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        <LogOut className="mr-2 size-4" />
        ログアウト
      </Button>
    );
  }

  return (
    <Button onClick={() => signIn.social({ provider: "google" })}>
      <LogIn className="mr-2 size-4" />
      Googleでログイン
    </Button>
  );
}
```

## ログインページ

`src/app/(auth)/login/page.tsx`:

```typescript
import { SignInButton } from "@/components/auth/sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ようこそ</CardTitle>
          <CardDescription>
            家族専用アプリにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <SignInButton />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 認証必須レイアウト

`src/app/(protected)/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
```

## ダッシュボード

`src/app/(protected)/dashboard/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <SignInButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ようこそ、{session?.user.name}さん</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ここにアプリのメインコンテンツを追加してください。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## トップページ

`src/app/page.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-4xl font-bold">Family App</h1>
      <p className="mb-8 text-muted-foreground">家族専用アプリ</p>

      {session ? (
        <Button asChild>
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href="/login">ログイン</Link>
        </Button>
      )}
    </div>
  );
}
```

## ルートレイアウト

`src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Family App",
  description: "家族専用アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```
