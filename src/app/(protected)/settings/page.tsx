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
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {session?.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="size-12 rounded-full"
                />
              ) : (
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="size-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-medium">{session?.user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {session?.user.email}
                </div>
              </div>
            </div>
            <SignInButton />
          </div>
        </CardContent>
      </Card>

      {/* Master settings */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground px-1">
          マスタ設定
        </h2>

        <Link href="/exercises">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">種目マスタ</div>
                  <div className="text-sm text-muted-foreground">
                    トレーニング種目の追加・編集
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/presets">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">プリセット</div>
                  <div className="text-sm text-muted-foreground">
                    トレーニングメニューのテンプレート
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
