
"use client";

import { mockExams } from "@/lib/data";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ExamListProps {
  isAdmin: boolean;
}

export function ExamList({ isAdmin }: ExamListProps) {
  const { toast } = useToast();
    const badgeVariants = cva(
        "capitalize",
        {
          variants: {
            status: {
              Published: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40",
              Draft: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/40",
              Archived: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700/40",
            },
          },
        }
      )
  
  const handleDelete = (examId: string, examTitle: string) => {
    console.log(`Deleting exam ${examId}`);
    // Here you would typically call an API to delete the exam
    toast({
      title: "試験が削除されました",
      description: `「${examTitle}」は正常に削除されました。`,
    })
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>問題数</TableHead>
            <TableHead>合計点</TableHead>
            <TableHead>時間</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockExams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className={badgeVariants({ status: exam.status })}>
                  {exam.status === 'Published' ? '公開済み' : exam.status === 'Draft' ? '下書き' : 'アーカイブ済み'}
                </Badge>
              </TableCell>
              <TableCell>{exam.questions.length}</TableCell>
              <TableCell>{exam.totalPoints}</TableCell>
              <TableCell>{exam.duration} 分</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">アクション</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                               <Link href={`/exam/${exam.id}`}><Eye className="mr-2 h-4 w-4"/>表示</Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/create-exam?examId=${exam.id}`}><Edit className="mr-2 h-4 w-4"/>編集</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive hover:!text-destructive focus:!text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4"/>削除
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                                この操作は元に戻すことはできません。試験「{exam.title}」と関連するすべてのデータが完全に削除されます。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(exam.id, exam.title)} className="bg-destructive hover:bg-destructive/90">削除</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
