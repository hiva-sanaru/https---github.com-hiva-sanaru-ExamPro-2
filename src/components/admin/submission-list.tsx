
"use client";

import { mockSubmissions, mockExams, mockUsers } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from "next/link";
import { Eye } from "lucide-react";

export function SubmissionList() {
    const badgeVariants = cva(
        "capitalize",
        {
          variants: {
            status: {
              Completed: "bg-green-100 text-green-800 border-green-200",
              Submitted: "bg-blue-100 text-blue-800 border-blue-200",
              Grading: "bg-yellow-100 text-yellow-800 border-yellow-200",
              "In Progress": "bg-gray-100 text-gray-800 border-gray-200",
            },
          },
        }
    )

    const getStatusName = (status: string) => {
        switch(status) {
            case 'Completed': return '完了';
            case 'Submitted': return '提出済み';
            case 'Grading': return '採点中';
            case 'In Progress': return '進行中';
            default: return '不明';
        }
    }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>試験名</TableHead>
            <TableHead>受験者名</TableHead>
            <TableHead>本部</TableHead>
            <TableHead>提出日時</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockSubmissions.map((submission) => {
            const exam = mockExams.find(e => e.id === submission.examId);
            const examinee = mockUsers.find(u => u.id === submission.examineeId);
            return (
                <TableRow key={submission.id}>
                    <TableCell className="font-medium">{exam?.title || 'N/A'}</TableCell>
                    <TableCell>{examinee?.name || 'N/A'}</TableCell>
                    <TableCell>{submission.examineeHeadquarters}</TableCell>
                    <TableCell>{format(submission.submittedAt, "PPP p", { locale: ja })}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={badgeVariants({ status: submission.status as any })}>
                            {getStatusName(submission.status)}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Link href={`/admin/review/${submission.id}`} passHref>
                             <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                レビューする
                            </Button>
                        </Link>
                    </TableCell>
                </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
