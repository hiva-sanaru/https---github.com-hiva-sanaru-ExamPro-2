import { LoginForm } from "@/components/auth/login-form";
import { BookAIcon } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-8">
      <div className="flex w-full max-w-md flex-col items-center space-y-6">
        <div className="flex items-center space-x-3 text-primary">
          <BookAIcon className="h-10 w-10" />
          <h1 className="text-4xl font-bold font-headline">ExamPro-2</h1>
        </div>
        <p className="text-center text-muted-foreground">
          Welcome back. The AI-Powered Examination Platform for modern teams.
        </p>
        <LoginForm />
      </div>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ExamPro-2. All rights reserved.
      </footer>
    </main>
  );
}
