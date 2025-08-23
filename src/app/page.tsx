import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getExams } from "@/services/examService";
import type { Exam } from "@/lib/types";

async function ExamineeDashboard() {
    const exams: Exam[] = await getExams();
    const availableExams = exams.filter(e => e.status === 'Published');

    return (
        <main className="flex min-h-screen flex-col items-center bg-muted/40 p-4 sm:p-8">
            <div className="w-full max-w-4xl space-y-8">
                <header className="space-y-2 text-center">
                    <h1 className="text-4xl font-bold font-headline">ようこそ！</h1>
                    <p className="text-muted-foreground text-lg">
                        受験可能な試験の一覧です。準備ができたら試験を開始してください。
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>受験可能な試験</CardTitle>
                        <CardDescription>{availableExams.length} 件の試験が利用可能です。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {availableExams.length > 0 ? (
                            availableExams.map((exam) => (
                                <div key={exam.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <h3 className="font-semibold">{exam.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            試験時間: {exam.duration}分 | 合計点: {exam.totalPoints}点
                                        </p>
                                    </div>
                                    <Link href={`/exam/${exam.id}`} passHref>
                                        <Button>
                                            試験を開始
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                現在、受験可能な試験はありません。
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <footer className="text-center text-sm text-muted-foreground pt-4">
                    © {new Date().getFullYear()} SANARUスタッフ昇給試験サイト. 無断複写・転載を禁じます。
                </footer>
            </div>
        </main>
    );
}

export default ExamineeDashboard;
