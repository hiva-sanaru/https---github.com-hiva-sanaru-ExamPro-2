"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

const userSchema = z.object({
    name: z.string().min(1, { message: "名前は必須です。" }),
    email: z.string().email({ message: "無効なメールアドレスです。" }),
    password: z.string().min(8, { message: "パスワードは8文字以上である必要があります。" }).optional().or(z.literal('')),
    role: z.enum(["system_administrator", "hq_administrator", "examinee"], {
        required_error: "役割を選択する必要があります。",
    }),
    headquarters: z.string().optional(),
}).refine(data => {
    if (data.role === 'hq_administrator' && !data.headquarters) {
        return false;
    }
    return true;
}, {
    message: "本部管理者の場合は本部を選択してください。",
    path: ["headquarters"],
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserFormProps {
    user?: User; // Make user optional for creating new users
    onFinished?: () => void;
}


export function AddUserForm({ user, onFinished }: AddUserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "examinee",
      headquarters: user?.headquarters || "",
    },
  });
  
  const role = form.watch("role");

  const onSubmit = (data: UserFormValues) => {
    setIsLoading(true);
    console.log("User data:", data);
    // Simulate API call
    setTimeout(() => {
        toast({
            title: isEditing ? "ユーザーが正常に更新されました！" : "ユーザーが正常に追加されました！",
            description: `名前: ${data.name}, メール: ${data.email}`,
        });
      setIsLoading(false);
      onFinished?.();
    }, 1500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="田中 太郎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditing ? "変更する場合のみ入力" : "••••••••"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>役割</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="役割を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="examinee">受験者</SelectItem>
                  <SelectItem value="hq_administrator">本部管理者</SelectItem>
                  <SelectItem value="system_administrator">システム管理者</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {(role === 'hq_administrator' || role === 'examinee') && (
            <FormField
            control={form.control}
            name="headquarters"
            render={({ field }) => (
                <FormItem>
                <FormLabel>本部</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="本部を選択" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Osaka">Osaka</SelectItem>
                        <SelectItem value="Fukuoka">Fukuoka</SelectItem>
                        <SelectItem value="Hokkaido">Hokkaido</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? (isEditing ? "更新中..." : "作成中...") : (isEditing ? "変更を保存" : "ユーザーを作成")}
            </Button>
        </div>
      </form>
    </Form>
  );
}
