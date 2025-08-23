import { ReviewPanel } from "@/components/admin/review-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockExams, mockSubmissions } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ja } from 'date-fns/locale';

export default function AdminReviewPage({ params }: { params: { submissionId: string } }) {
    const submission = mockSubmissions.find(s => s.id === params.submissionId);
    if (!submission) {
        notFound();
    }
    const exam = mockExams.find(e => e.id === submission.examId);
    if (!exam) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">提出物のレビュー</h1>
                <p className="text-muted-foreground">試験の採点: "{exam.title}"</p>
            </div>

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
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <strong>提出日時:</strong> <span>{format(submission.submittedAt, "PPP p", { locale: ja })}</span>
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
