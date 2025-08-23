import { ReviewPanel } from "@/components/admin/review-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockExams, mockSubmissions } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatInTimeZone } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// This is a mock of a logged-in user.
// In a real application, this would come from an authentication context.
const MOCK_ADMIN_USER = {
    id: 'admin1',
    role: 'hq_administrator', // Try changing this to 'system_administrator'
    headquarters: 'Tokyo' // This is ignored if role is 'system_administrator'
}

export default function AdminReviewPage({ params }: { params: { submissionId: string } }) {
    const submission = mockSubmissions.find(s => s.id === params.submissionId);
    if (!submission) {
        notFound();
    }
    const exam = mockExams.find(e => e.id === submission.examId);
    if (!exam) {
        notFound();
    }

    // RBAC check:
    const hasAccess = MOCK_ADMIN_USER.role === 'system_administrator' || 
                      (MOCK_ADMIN_USER.role === 'hq_administrator' && MOCK_ADMIN_USER.headquarters === submission.examineeHeadquarters);

    if (!hasAccess) {
        return (
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">アクセスが拒否されました</h1>
                    <p className="text-muted-foreground">この提出物を閲覧する権限がありません。</p>
                </div>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>権限エラー</AlertTitle>
                    <AlertDescription>
                        あなたは <strong>{MOCK_ADMIN_USER.headquarters}</strong> の本部管理者ですが、この提出物は <strong>{submission.examineeHeadquarters}</strong> 本部のものです。
                        システム管理者に連絡してアクセスをリクエストしてください。
                    </AlertDescription>
                </Alert>
            </div>
        )
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">提出物のレビュー</h1>
                <p className="text-muted-foreground">試験の採点: "{exam.title}"</p>
            </div>

             {MOCK_ADMIN_USER.role === 'system_administrator' && (
                 <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>システム管理者ビュー</AlertTitle>
                    <AlertDescription>
                        あなたはシステム管理者として、すべての提出物を閲覧・管理する権限を持っています。
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>提出詳細</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <strong>受験者:</strong> <span>受験者ユーザー (ID: {submission.examineeId})</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <strong>本部:</strong> <span>{submission.examineeHeadquarters}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <strong>提出日時:</strong> <span>{formatInTimeZone(submission.submittedAt, 'Asia/Tokyo', "PPP p", { locale: ja })}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <strong>ステータス:</strong> <span>{submission.status}</span>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="hq" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="hq" className="font-headline">
                        本部採点
                    </TabsTrigger>
                    <TabsTrigger value="po" className="font-headline">
                        人事部レビュー
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="hq">
                   <ReviewPanel
                        exam={exam}
                        submission={submission}
                        reviewerRole="本部"
                    />
                </TabsContent>
                <TabsContent value="po">
                    <ReviewPanel
                        exam={exam}
                        submission={submission}
                        reviewerRole="人事部"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
