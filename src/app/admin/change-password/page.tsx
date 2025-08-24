
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { findUserByEmployeeId, updateUser } from '@/services/userService';
import type { User } from '@/lib/types';

const passwordSchema = z.object({
  password: z.string().min(8, { message: "パスワードは8文字以上である必要があります。" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません。",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const employeeId = localStorage.getItem('loggedInUserEmployeeId');
    if (employeeId) {
      findUserByEmployeeId(employeeId)
        .then(user => {
          setCurrentUser(user);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      toast({
        title: "エラー",
        description: "ユーザーが見つかりません。再度ログインしてください。",
        variant: "destructive"
      });
      router.push('/login');
    }
  }, [router, toast]);


  const onSubmit = async (data: PasswordFormValues) => {
    if (!currentUser) {
       toast({
        title: "エラー",
        description: "ユーザー情報が見つかりません。",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      await updateUser(currentUser.id, { password: data.password });
      toast({
        title: "成功",
        description: "パスワードが正常に更新されました。",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to update password", error);
      toast({
        title: "保存エラー",
        description: "パスワードの更新中にエラーが発生しました。",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">パスワード変更</h1>
        <p className="text-muted-foreground">セキュリティのため、新しいパスワードを設定してください。</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>新しいパスワードの設定</CardTitle>
          <CardDescription>
            {currentUser?.name} ({currentUser?.employeeId})さんのパスワードを変更します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新しいパスワード</FormLabel>
                     <div className="relative">
                       <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新しいパスワード（確認）</FormLabel>
                     <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? "保存中..." : "パスワードを保存"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
