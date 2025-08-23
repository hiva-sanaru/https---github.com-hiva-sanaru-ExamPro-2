"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { User } from "@/lib/types";
import { cva } from "class-variance-authority";
import { AddUserForm } from "./add-user-form";

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
    const [openDialogs, setOpenDialogs] = React.useState<Record<string, boolean>>({});

    const handleDialogChange = (userId: string, open: boolean) => {
        setOpenDialogs(prev => ({ ...prev, [userId]: open }));
    };

    const badgeVariants = cva(
        "capitalize",
        {
          variants: {
            role: {
              system_administrator: "bg-red-100 text-red-800 border-red-200",
              hq_administrator: "bg-blue-100 text-blue-800 border-blue-200",
              examinee: "bg-gray-100 text-gray-800 border-gray-200",
            },
          },
        }
    )

    const getRoleName = (role: User['role']) => {
        switch(role) {
            case 'system_administrator': return 'システム管理者';
            case 'hq_administrator': return '本部管理者';
            case 'examinee': return '受験者';
        }
    }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>社員番号</TableHead>
            <TableHead>役割</TableHead>
            <TableHead>本部</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">{user.name}</span>
                    </div>
                </div>
              </TableCell>
              <TableCell>{user.employeeId}</TableCell>
              <TableCell>
                <Badge variant="outline" className={badgeVariants({ role: user.role })}>
                  {getRoleName(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{user.headquarters || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <Dialog open={openDialogs[user.id] || false} onOpenChange={(open) => handleDialogChange(user.id, open)}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">アクション</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit className="mr-2 h-4 w-4" />編集</DropdownMenuItem>
                            </DialogTrigger>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive hover:text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />削除</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>ユーザーを編集</DialogTitle>
                            <DialogDescription>
                                ユーザーの詳細を更新します。
                            </DialogDescription>
                        </DialogHeader>
                        <AddUserForm user={user} onFinished={() => handleDialogChange(user.id, false)} />
                    </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
