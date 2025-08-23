
'use client';
import { useState, useEffect } from 'react';
import { SubmissionList } from "@/components/admin/submission-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockExams, mockSubmissions } from "@/lib/data";
import { getUsers } from '@/services';
import type { User } from '@/lib/types';
import { FileText } from "lucide-react";

export default function ReviewListPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users for export", error);
        }
    }
    fetchUsers();
  }, []);

  const handleExportSubmissions = () => {
        const headers = [
            "提出ID",
            "試験名",
            "受験者名",
            "受験者本部",
            "提出日時",
            "ステータス",
            "本部スコア",
            "人事部スコア",
            "最終スコア",
            "授業審査希望日1",
            "授業審査希望終了日1",
            "授業審査希望日2",
            "授業審査希望終了日2"
        ];
        
        const rows = mockSubmissions.map(submission => {
            const exam = mockExams.find(e => e.id === submission.examId);
            const examinee = users.find(u => u.id === submission.examineeId);
            return [
                submission.id,
                exam?.title || "N/A",
                examinee?.name || "N/A",
                submission.examineeHeadquarters || "N/A",
                submission.submittedAt.toISOString(),
                submission.status,
                submission.hqGrade?.score ?? "N/A",
                submission.poGrade?.score ?? "N/A",
                submission.finalScore ?? "N/A",
                submission.lessonReviewDate1?.toISOString() ?? "N/A",
                submission.lessonReviewEndDate1?.toISOString() ?? "N/A",
                submission.lessonReviewDate2?.toISOString() ?? "N/A",
                submission.lessonReviewEndDate2?.toISOString() ?? "N/A"
            ].join(',');
        });

        const csvString = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: "text/csv;charset=utf-8;" }); // BOM for Excel compatibility
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sanaru_submissions_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">提出物のレビュー</h1>
        <p className="text-muted-foreground">採点またはレビューが必要な提出物の一覧です。</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>提出物リスト</CardTitle>
            <CardDescription>提出物を選択してレビューを開始してください。</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportSubmissions}>
              <FileText className="mr-2 h-4 w-4" />
              提出物をエクスポート
          </Button>
        </CardHeader>
        <CardContent>
          <SubmissionList />
        </CardContent>
      </Card>
    </div>
  );
}

    