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
      <Button
        variant="outline"
        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
      >
        <LogOut className="mr-2 size-4" />
        ログアウト
      </Button>
    );
  }

  return (
    <Button
      onClick={() =>
        signIn.social({ provider: "google", callbackURL: "/dashboard" })
      }
    >
      <LogIn className="mr-2 size-4" />
      Googleでログイン
    </Button>
  );
}
