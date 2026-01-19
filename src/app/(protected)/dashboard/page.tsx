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
