import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamList } from "@/components/admin/exam-list";
import { PlusCircle } from "lucide-react";

// This is a mock of a logged-in user.
// In a real application, this would come from an authentication context.
const MOCK_ADMIN_USER = {
    id: 'admin1',
    role: 'hq_administrator', // Try changing this to 'system_administrator'
    headquarters: 'Tokyo' 
}


export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">管理者ダッシュボード</h1>
                <p className="text-muted-foreground">おかえりなさい、管理者さん！ここで試験とユーザーを管理します。</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">合計試験数</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M15 21v-4.37a2 2 0 0 0-1.09-1.79l-1.83-1.1-3.18 3.2Z"></path><path d="m9.13 11.3-3.18 3.2 2.74 1.79A2 2 0 0 0 10 18.63V21"></path><path d="M12 3v5.88"></path><path d="M12 21v-5.88"></path><path d="M4.22 10.22 12 18l7.78-7.78"></path><path d="M19.78 10.22 12 18l-7.78-7.78"></path></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">先月から+1</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">提出物</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+125</div>
                        <p className="text-xs text-muted-foreground">過去24時間</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">平均スコア</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">88.5%</div>
                        <p className="text-xs text-muted-foreground">前回の試験サイクルから+2.1%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+256</div>
                        <p className="text-xs text-muted-foreground">オンライン中</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl">試験の管理</CardTitle>
                        <CardDescription>システム内のすべての試験を作成、編集、表示します。</CardDescription>
                    </div>
                     {MOCK_ADMIN_USER.role === 'system_administrator' && (
                        <Button>
                            <PlusCircle />
                            試験を作成
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <ExamList isAdmin={MOCK_ADMIN_USER.role === 'system_administrator'} />
                </CardContent>
            </Card>
        </div>
    );
}
