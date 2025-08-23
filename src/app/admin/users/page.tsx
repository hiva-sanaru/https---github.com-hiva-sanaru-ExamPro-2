
'use client';

import { useState } from "react";
import { AddUserForm } from "@/components/admin/add-user-form";
import { UserList } from "@/components/admin/user-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/lib/data";
import type { User, UserRole } from "@/lib/types";
import { PlusCircle, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const headquartersList = ["Tokyo", "Osaka", "Fukuoka", "Hokkaido"];

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [hqFilter, setHqFilter] = useState("all");

    const filteredUsers = mockUsers.filter((user: User) => {
        const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = roleFilter === 'all' || user.role === roleFilter;
        const hqMatch = hqFilter === 'all' || user.headquarters === hqFilter;
        return nameMatch && roleMatch && hqMatch;
    });

    const getRoleName = (role: UserRole) => {
        switch(role) {
            case 'system_administrator': return 'システム管理者';
            case 'hq_administrator': return '本部管理者';
            case 'examinee': return '受験者';
        }
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">ユーザー管理</h1>
                <p className="text-muted-foreground">システム内のすべてのユーザーを管理します。</p>
            </div>
             <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline text-xl">ユーザーリスト</CardTitle>
                            <CardDescription>{filteredUsers.length}人のユーザーが見つかりました。</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="名前で検索..." 
                                    className="pl-10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="役割で絞り込み" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">すべての役割</SelectItem>
                                    <SelectItem value="system_administrator">システム管理者</SelectItem>
                                    <SelectItem value="hq_administrator">本部管理者</SelectItem>
                                    <SelectItem value="examinee">受験者</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={hqFilter} onValueChange={setHqFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="本部で絞り込み" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">すべての本部</SelectItem>
                                    {headquartersList.map(hq => (
                                        <SelectItem key={hq} value={hq}>{hq}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full sm:w-auto">
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
                    </div>
                </CardHeader>
                <CardContent>
                    <UserList users={filteredUsers} />
                </CardContent>
            </Card>
        </div>
    )
}
