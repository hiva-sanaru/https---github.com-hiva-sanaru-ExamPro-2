
"use client"
import React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileCheck2, Users, Settings, LogOut, Building } from "lucide-react";


export function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { href: "/admin/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
        { href: "/admin/review", label: "提出物", icon: FileCheck2 },
        { href: "/admin/users", label: "ユーザー", icon: Users },
        { href: "/admin/headquarters", label: "本部管理", icon: Building },
    ]

    return (
        <SidebarProvider>
            <Sidebar variant="sidebar" collapsible="icon">
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <span className="font-headline text-lg font-semibold text-primary-foreground">SANARU</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                             <SidebarMenuItem key={item.href}>
                                <Link href={item.href}>
                                    <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <Separator className="my-2 bg-sidebar-border" />
                    <div className="flex flex-col gap-2 p-2">
                         <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:w-8">
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-semibold text-sidebar-foreground">管理者ユーザー</span>
                                <span className="text-xs text-sidebar-foreground/70">admin@exampro.com</span>
                            </div>
                        </div>
                        <Link href="/login">
                            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
                                <LogOut className="size-4 shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">ログアウト</span>
                            </Button>
                        </Link>
                    </div>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:justify-end">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
