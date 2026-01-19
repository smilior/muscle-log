import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Dumbbell, ListChecks, ChevronRight, User } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* User info */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {session?.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="size-10 rounded-full"
                />
              ) : (
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="size-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{session?.user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {session?.user.email}
                </div>
              </div>
            </div>
            <SignInButton />
          </div>
        </CardContent>
      </Card>

      {/* Master settings */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground px-1">
          マスタ設定
        </h2>

        <Link href="/exercises" prefetch={true}>
          <Card className="hover:bg-muted/50 active:scale-[0.99] transition-all duration-100">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">種目マスタ</div>
                  <div className="text-xs text-muted-foreground">
                    トレーニング種目の追加・編集
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/presets" prefetch={true}>
          <Card className="hover:bg-muted/50 active:scale-[0.99] transition-all duration-100">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">プリセット</div>
                  <div className="text-xs text-muted-foreground">
                    トレーニングメニューのテンプレート
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
