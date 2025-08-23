
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { User, Submission, Exam } from "@/lib/types";
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
import { formatInTimeZone } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";

interface SubmissionListProps {
    submissions: Submission[];
    exams: Exam[];
    users: User[];
}

export function SubmissionList({ submissions, exams, users }: SubmissionListProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (submissions.length > 0 && exams.length > 0 && users.length > 0) {
            setIsLoading(false);
        }
    }, [submissions, exams, users]);


    const usersMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [users]);
    
    const examsMap = useMemo(() => {
        return exams.reduce((acc, exam) => {
            acc[exam.id] = exam;
            return acc;
        }, {} as Record<string, Exam>);
    }, [exams]);


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
          {isLoading && submissions.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
            </TableRow>
          ) : submissions.length === 0 ? (
             <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    提出物はまだありません。
                </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => {
                const exam = examsMap[submission.examId];
                const examinee = usersMap[submission.examineeId];
                return (
                    <TableRow key={submission.id}>
                        <TableCell className="font-medium">{exam?.title || 'N/A'}</TableCell>
                        <TableCell>{examinee?.name || 'N/A'}</TableCell>
                        <TableCell>{submission.examineeHeadquarters}</TableCell>
                        <TableCell>{formatInTimeZone(submission.submittedAt, 'Asia/Tokyo', "PPP p", { locale: ja })}</TableCell>
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
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
