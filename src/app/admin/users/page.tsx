import { AddUserForm } from "@/components/admin/add-user-form";
import { UserList } from "@/components/admin/user-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockUsers } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">ユーザー管理</h1>
                <p className="text-muted-foreground">システム内のすべてのユーザーを管理します。</p>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl">ユーザーリスト</CardTitle>
                        <CardDescription>{mockUsers.length}人のユーザーが登録されています。</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                ユーザーを追加
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>新規ユーザーを追加</DialogTitle>
                                <DialogDescription>
                                    新しいユーザーの詳細を入力してください。
                                </DialogDescription>
                            </DialogHeader>
                            <AddUserForm />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <UserList users={mockUsers} />
                </CardContent>
            </Card>
        </div>
    )
}
