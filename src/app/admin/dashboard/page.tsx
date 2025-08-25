
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamList } from "@/components/admin/exam-list";
import { PlusCircle, Download, Loader2, FilePen, CheckSquare, Users, FileText } from "lucide-react";
import Link from "next/link";
import { getUsers, findUserByEmployeeId } from "@/services/userService";
import { getExams } from "@/services/examService";
import { getSubmissions } from "@/services/submissionService";
import type { User, Exam, Submission } from '@/lib/types';


export default function AdminDashboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const employeeId = localStorage.getItem('loggedInUserEmployeeId');
                let userPromise: Promise<User | null> = Promise.resolve(null);
                if (employeeId) {
                    userPromise = findUserByEmployeeId(employeeId);
                }

                const [fetchedUsers, fetchedExams, fetchedSubmissions, loggedInUser] = await Promise.all([
                    getUsers(),
                    getExams(),
                    getSubmissions(),
                    userPromise,
                ]);
                
                setUsers(fetchedUsers);
                setExams(fetchedExams);
                setSubmissions(fetchedSubmissions);
                setCurrentUser(loggedInUser);

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const dashboardStats = useMemo(() => {
        const ungradedSubmissions = submissions.filter(s => s.status === 'Submitted').length;
        const pendingReviewSubmissions = submissions.filter(s => s.status === 'Grading').length;
        const examineeCount = users.filter(u => u.role === 'examinee').length;
        return { ungradedSubmissions, pendingReviewSubmissions, examineeCount };
    }, [submissions, users]);

    const handleBackup = () => {
        const backupData = {
            users: users,
            exams: exams,
            submissions: submissions,
            timestamp: new Date().toISOString(),
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sanaru_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">管理者ダッシュボード</h1>
                 {isLoading ? (
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                ) : (
                    <p className="text-muted-foreground">おかえりなさい、{currentUser?.name || 'ゲスト'}さん！ここで試験とユーザーを管理します。</p>
                )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">合計試験数</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <div className="h-8 w-12 bg-muted rounded animate-pulse" /> : <div className="text-2xl font-bold">{exams.length}</div> }
                        <p className="text-xs text-muted-foreground">下書きを含む</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">未採点の提出</CardTitle>
                        <FilePen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <div className="h-8 w-12 bg-muted rounded animate-pulse" /> : <div className="text-2xl font-bold">{dashboardStats.ungradedSubmissions}</div> }
                        <p className="text-xs text-muted-foreground">本部の採点待ち</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">レビュー待ちの提出</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <div className="h-8 w-12 bg-muted rounded animate-pulse" /> : <div className="text-2xl font-bold">{dashboardStats.pendingReviewSubmissions}</div> }
                        <p className="text-xs text-muted-foreground">人事室のレビュー待ち</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">アクティブな受験者</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <div className="h-8 w-12 bg-muted rounded animate-pulse" /> : <div className="text-2xl font-bold">+{dashboardStats.examineeCount}</div> }
                        <p className="text-xs text-muted-foreground">登録済みの受験者</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl">試験の管理</CardTitle>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleBackup}>
                            <Download />
                            データをバックアップ
                        </Button>
                        {currentUser?.role === 'system_administrator' && (
                            <Link href="/admin/create-exam" passHref>
                                <Button>
                                    <PlusCircle />
                                    試験を作成
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <ExamList isAdmin={currentUser?.role === 'system_administrator'} />
                </CardContent>
            </Card>
        </div>
    );
}
