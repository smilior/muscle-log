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
      <h1 className="mb-4 text-4xl font-bold">Muscle Log</h1>
      <p className="mb-8 text-muted-foreground">家族専用トレーニング記録アプリ</p>

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
