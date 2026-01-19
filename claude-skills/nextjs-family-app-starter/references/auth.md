# 認証設定 (2026年1月 - Better Auth 1.4+)

## Better Auth サーバー設定

`src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./db/schema";

// 許可するメールアドレス（家族のみ）
const allowedEmails = [
  "your-email@gmail.com",
  "spouse-email@gmail.com",
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: false, // Google認証のみ使用
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  callbacks: {
    // 許可されたメールのみサインイン可能
    async onBeforeCreateUser({ user }) {
      if (!allowedEmails.includes(user.email)) {
        throw new Error("このアプリは招待されたユーザーのみ利用できます");
      }
      return user;
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30日
    updateAge: 60 * 60 * 24, // 1日ごとに更新
  },
  plugins: [
    nextCookies(), // Server Actionsでのcookie設定用（最後に配置）
  ],
});

export type Session = typeof auth.$Infer.Session;
```

## Better Auth クライアント設定

`src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient;
```

## APIルート

`src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## サーバーサイドでのセッション取得

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
```

## Proxy (Next.js 16 - 旧Middleware)

`src/proxy.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // 注意: cookieの存在確認のみ（セキュアな検証は各ページで行う）
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

**重要**: Next.js 16では `middleware.ts` が `proxy.ts` にリネームされました。
移行コマンド: `npx @next/codemod@canary middleware-to-proxy .`

## Node.jsランタイムでの完全なセッション検証（オプション）

`src/proxy.ts` (Node.jsランタイム版):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Node.jsランタイムを使用
  matcher: ["/dashboard/:path*"],
};
```
