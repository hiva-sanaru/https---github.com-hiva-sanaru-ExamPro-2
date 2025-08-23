
'use client';

import { useState } from "react";
import { AddUserForm } from "@/components/admin/add-user-form";
import { UserList } from "@/components/admin/user-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { PlusCircle, Search } from "lucide-react";

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = mockUsers.filter((user: User) => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">ユーザー管理</h1>
                <p className="text-muted-foreground">システム内のすべてのユーザーを管理します。</p>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="font-headline text-xl">ユーザーリスト</CardTitle>
                        <CardDescription>{filteredUsers.length}人のユーザーが見つかりました。</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="名前で検索..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                    </div>
                </CardHeader>
                <CardContent>
                    <UserList users={filteredUsers} />
                </CardContent>
            </Card>
        </div>
    )
}
