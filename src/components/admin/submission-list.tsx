
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { cva } from "class-variance-authority";
import { formatInTimeZone } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { updateSubmission } from "@/services/submissionService";
import { useToast } from "@/hooks/use-toast";

interface SubmissionListProps {
    submissions: Submission[];
    exams: Exam[];
    users: User[];
    isSystemAdmin: boolean;
}

export function SubmissionList({ submissions, exams, users, isSystemAdmin }: SubmissionListProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Use a local state to manage submissions to reflect checkbox changes instantly
    const [localSubmissions, setLocalSubmissions] = useState(submissions);

    useEffect(() => {
        setLocalSubmissions(submissions);
    }, [submissions]);

    useEffect(() => {
        if (submissions.length > 0 && exams.length > 0 && users.length > 0) {
            setIsLoading(false);
        }
        // Handle case where there are no submissions
        if (submissions.length === 0) {
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

    const handleCheckboxChange = async (submission: Submission) => {
        const updatedStatus = !submission.resultCommunicated;

        // Optimistically update the UI
        setLocalSubmissions(prev => 
            prev.map(s => 
                s.id === submission.id ? { ...s, resultCommunicated: updatedStatus } : s
            )
        );

        try {
            await updateSubmission(submission.id, { resultCommunicated: updatedStatus });
            toast({
                title: "ステータスが更新されました",
                description: `提出ID ${submission.id} の結果伝達ステータスが変更されました。`,
            });
        } catch (error) {
            // Revert on error
            setLocalSubmissions(prev => 
                prev.map(s => 
                    s.id === submission.id ? { ...s, resultCommunicated: !updatedStatus } : s
                )
            );
            toast({
                title: "更新エラー",
                description: "ステータスの更新中にエラーが発生しました。",
                variant: "destructive",
            });
            console.error("Failed to update submission status:", error);
        }
    };


    const badgeVariants = cva(
        "capitalize",
        {
          variants: {
            status: {
              Passed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40",
              Failed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40",
              Submitted: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/40",
              Grading: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/40",
              "In Progress": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700/40",
            },
          },
        }
    )

    const getStatusName = (status: Submission['status']) => {
        switch(status) {
            case 'Passed': return '合格';
            case 'Failed': return '不合格';
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
          <TableRow className="bg-primary hover:bg-primary/90">
            <TableHead className="text-primary-foreground">試験名</TableHead>
            <TableHead className="text-primary-foreground">受験者名</TableHead>
            <TableHead className="text-primary-foreground">本部</TableHead>
            <TableHead className="text-primary-foreground">提出日時</TableHead>
            <TableHead className="text-primary-foreground">ステータス</TableHead>
            <TableHead className="text-primary-foreground">結果伝達</TableHead>
            <TableHead className="text-right text-primary-foreground">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
            </TableRow>
          ) : localSubmissions.length === 0 ? (
             <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                    提出物はまだありません。
                </TableCell>
            </TableRow>
          ) : (
            localSubmissions.map((submission) => {
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
                         <TableCell className="text-center">
                             <Checkbox 
                                id={`comm-${submission.id}`}
                                checked={!!submission.resultCommunicated}
                                onCheckedChange={() => handleCheckboxChange(submission)}
                                disabled={!isSystemAdmin}
                                aria-label="結果伝達済み"
                            />
                        </TableCell>
                        <TableCell className="text-right">
                            <Link href={`/admin/review/${submission.id}`} passHref>
                                 <Button variant="outline" size="sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    採点する
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
