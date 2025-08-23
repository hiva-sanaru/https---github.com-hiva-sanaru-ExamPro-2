
import { SubmissionList } from "@/components/admin/submission-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReviewListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">提出物のレビュー</h1>
        <p className="text-muted-foreground">採点またはレビューが必要な提出物の一覧です。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>提出物リスト</CardTitle>
          <CardDescription>提出物を選択してレビューを開始してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionList />
        </CardContent>
      </Card>
    </div>
  );
}
