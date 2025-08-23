import { LoginForm } from "@/components/auth/login-form";
import { BookAIcon } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-8">
      <div className="flex w-full max-w-md flex-col items-center space-y-6">
        <div className="flex items-center space-x-3 text-primary">
          <BookAIcon className="h-10 w-10" />
          <h1 className="text-3xl font-bold font-headline">SANARUスタッフ昇給試験サイト</h1>
        </div>
        <p className="text-center text-muted-foreground">
          おかえりなさい。現代のチームのためのAI搭載試験プラットフォーム。
        </p>
        <LoginForm />
      </div>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SANARUスタッフ昇給試験サイト. 無断複写・転載を禁じます。
      </footer>
    </main>
  );
}
