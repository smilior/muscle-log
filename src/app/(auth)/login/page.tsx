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
