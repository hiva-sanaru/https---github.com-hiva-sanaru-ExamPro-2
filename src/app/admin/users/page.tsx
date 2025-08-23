import { UserList } from "@/components/admin/user-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        ユーザーを追加
                    </Button>
                </CardHeader>
                <CardContent>
                    <UserList users={mockUsers} />
                </CardContent>
            </Card>
        </div>
    )
}
