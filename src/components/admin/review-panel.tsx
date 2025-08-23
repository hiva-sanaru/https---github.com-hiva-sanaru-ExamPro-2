
"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { ja } from 'date-fns/locale';
import { gradeAnswer } from "@/ai/flows/grade-answer";
import { useToast } from "@/hooks/use-toast";
import type { Exam, Submission, Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Wand2, User, Check, GitCommitHorizontal, Loader2, Calendar as CalendarIcon, Shield, Building } from "lucide-react";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface ReviewPanelProps {
  exam: Exam;
  submission: Submission;
  reviewerRole: "本部" | "人事部";
}

interface GradingResult {
  questionId: string;
  score: number;
  justification: string;
  isLoading: boolean;
}

interface ManualScore {
    [questionId: string]: number;
}

export function ReviewPanel({ exam, submission, reviewerRole }: ReviewPanelProps) {
  const { toast } = useToast();
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [manualScores, setManualScores] = useState<ManualScore>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkGrading, setIsBulkGrading] = useState(false);
  const [lessonReviewDate1, setLessonReviewDate1] = useState<Date | undefined>(submission.lessonReviewDate1);
  const [lessonReviewDate2, setLessonReviewDate2] = useState<Date | undefined>(submission.lessonReviewDate2);
  const [finalScore, setFinalScore] = useState<number | undefined>(submission.finalScore);


  useEffect(() => {
    // If role is PO, initialize scores and feedback from HQ's grade
    if (reviewerRole === "人事部" && submission.hqGrade) {
        setManualScores(submission.hqGrade.scores || {});
        setOverallFeedback(submission.poGrade?.justification || '');
        setFinalScore(submission.finalScore);
    } else {
        setManualScores(submission.hqGrade?.scores || {});
        setOverallFeedback(submission.hqGrade?.justification || '');
    }
  }, [submission, reviewerRole]);


  const totalScore = useMemo(() => {
     if (reviewerRole === '人事部') {
        return finalScore || submission.hqGrade?.score || 0;
     }
    return Object.values(manualScores).reduce((acc, score) => acc + (score || 0), 0);
  }, [manualScores, reviewerRole, finalScore, submission.hqGrade]);
  
  const isPassed = totalScore >= 80;

  const handleManualScoreChange = (questionId: string, score: string) => {
    if (reviewerRole === "人事部") return; // PO cannot change individual scores
    const newScore = Number(score);
    const question = exam.questions.find(q => q.id === questionId);
    if (!question || newScore > question.points) return;
    setManualScores(prev => ({...prev, [questionId]: newScore}));
  }

  const getAnswerForQuestion = (questionId: string) => {
    return submission.answers.find((a) => a.questionId === questionId)?.value || "N/A";
  };
  
  const handleGradeAllQuestions = async () => {
    if (reviewerRole === "人事部") return;
    setIsBulkGrading(true);
    toast({ title: "全問題のAI採点を開始しました...", description: "完了まで数秒お待ちください。" });

    const gradingPromises = exam.questions.map(question => {
        const answerText = getAnswerForQuestion(question.id);
        if (!answerText || answerText === "N/A" || !question.modelAnswer) {
            return Promise.resolve({ questionId: question.id, error: "回答または模範解答がありません" });
        }

        return gradeAnswer({
            questionText: question.text,
            modelAnswer: question.modelAnswer,
            answerText,
            points: question.points,
        }).then(result => ({ questionId: question.id, ...result }))
          .catch(error => ({ questionId: question.id, error: error.message }));
    });

    const results = await Promise.all(gradingPromises);
    
    const newGradingResults: GradingResult[] = [];
    const newManualScores: ManualScore = { ...manualScores };
    
    results.forEach(result => {
        if ('error' in result) {
            console.error(`AI採点エラー (Q${result.questionId}):`, result.error);
        } else {
            newGradingResults.push({
                questionId: result.questionId,
                score: result.score,
                justification: result.justification,
                isLoading: false,
            });
            newManualScores[result.questionId] = result.score;
        }
    });
    
    setGradingResults(newGradingResults);
    setManualScores(newManualScores);

    setIsBulkGrading(false);
    toast({ title: "AI一括採点が完了しました！", description: "各問題のスコアと評価を確認してください。" });
  }

  const handleSubmitReview = () => {
    setIsSubmitting(true);
    // In a real app, you would save this data to your backend.
    console.log({
        reviewerRole,
        submissionId: submission.id,
        scores: manualScores,
        totalScore,
        feedback: overallFeedback,
        lessonReviewDate1,
        lessonReviewDate2,
        finalScore: reviewerRole === '人事部' ? finalScore : undefined
    });

    setTimeout(() => {
        toast({ title: `${reviewerRole}のレビューが正常に送信されました！` });
        setIsSubmitting(false);
    }, 1500)
  }

  const isPersonnelOfficeView = reviewerRole === "人事部";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">{reviewerRole}レビュー</CardTitle>
                <CardDescription>
                  {isPersonnelOfficeView 
                    ? "本部採点の結果を確認し、最終評価を承認してください。"
                    : "受験者の回答を確認し、AI採点機能を使用して、評価を入力してください。"
                  }
                </CardDescription>
            </div>
            {!isPersonnelOfficeView && (
                <Button onClick={handleGradeAllQuestions} disabled={isBulkGrading}>
                    {isBulkGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isBulkGrading ? "採点中..." : "AIで一括採点"}
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPersonnelOfficeView && submission.hqGrade && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Building className="w-5 h-5 text-muted-foreground" />本部採点結果</CardTitle>
                    <CardDescription>
                        本部担当者 ({submission.hqGrade.reviewer}) による採点結果です。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>合計スコア:</span>
                        <span>{submission.hqGrade.score} / {exam.totalPoints}</span>
                    </div>
                     <div className="space-y-1 pt-2">
                        <Label>全体フィードバック</Label>
                        <p className="text-sm p-2 bg-background rounded-md">{submission.hqGrade.justification || "フィードバックはありません。"}</p>
                    </div>
                </CardContent>
            </Card>
        )}

        {exam.questions.map((question, index) => {
          const result = gradingResults.find((r) => r.questionId === question.id);
          const hqScore = submission.hqGrade?.scores?.[question.id];

          return (
            <Card key={question.id} className="overflow-hidden">
                <CardHeader className="bg-primary/90 text-primary-foreground p-4">
                    <div className="flex justify-between w-full items-center">
                        <CardTitle className="text-lg font-semibold text-left text-primary-foreground">問題 {index + 1}: {question.text} ({question.points}点)</CardTitle>
                        <div className="flex items-center gap-2">
                            {manualScores[question.id] !== undefined && <Badge variant="secondary">{isPersonnelOfficeView ? `本部採点: ${manualScores[question.id]}` : manualScores[question.id]}点</Badge>}
                            {result && !result.isLoading && <Badge variant="secondary">AI採点済み</Badge>}
                            {isBulkGrading && <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />受験者の回答</Label>
                            <p className="p-3 rounded-md bg-muted text-sm min-h-[100px]">{getAnswerForQuestion(question.id)}</p>
                        </div>
                         <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Bot className="w-4 h-4 text-muted-foreground" />AI採点</Label>
                            {result && !result.isLoading ? (
                                <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2 text-sm min-h-[100px]">
                                    <p><strong>スコア:</strong> {result.score}/{question.points}</p>
                                    <p><strong>根拠:</strong> {result.justification}</p>
                                </div>
                            ) : (
                                <div className="p-3 rounded-md bg-muted/50 border border-dashed flex items-center justify-center min-h-[100px]">
                                    <p className="text-sm text-muted-foreground">{isPersonnelOfficeView ? "AI採点は本部担当者が実施します。" : "「AIで一括採点」ボタンを押してください"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {!isPersonnelOfficeView && (
                        <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor={`score-${question.id}`}>あなたの評価</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    id={`score-${question.id}`} 
                                    type="number" 
                                    placeholder="スコア" 
                                    className="w-24" 
                                    max={question.points}
                                    min={0}
                                    value={manualScores[question.id] || ''}
                                    onChange={(e) => handleManualScoreChange(question.id, e.target.value)}
                                    readOnly={isPersonnelOfficeView}
                                />
                                <span className="text-muted-foreground">/ {question.points} 点</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-headline">最終評価</h3>
                <div className="text-2xl font-bold">
                    合計スコア: {totalScore} / {exam.totalPoints}
                </div>
            </div>

            {isPersonnelOfficeView && (
                <div className="space-y-2">
                    <Label htmlFor="final-score">最終スコア</Label>
                    <Input
                        id="final-score"
                        type="number"
                        value={finalScore ?? ""}
                        onChange={(e) => setFinalScore(parseInt(e.target.value, 10))}
                        placeholder="本部スコアを承認する場合は入力"
                    />
                </div>
            )}

            {isPassed && (
                 <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 mt-4">
                    <CardHeader>
                         <CardTitle className="text-green-800 dark:text-green-300">合格 - 授業審査へ</CardTitle>
                         <CardDescription>合計スコアが80点以上です。授業審査の希望日時を入力してください。</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="date1">第一希望日時</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !lessonReviewDate1 && "text-muted-foreground"
                                    )}
                                    disabled={isPersonnelOfficeView}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {lessonReviewDate1 ? format(lessonReviewDate1, "PPP", { locale: ja }) : <span>日付を選択</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={lessonReviewDate1}
                                        onSelect={setLessonReviewDate1}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="date2">第二希望日時</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !lessonReviewDate2 && "text-muted-foreground"
                                    )}
                                    disabled={isPersonnelOfficeView}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {lessonReviewDate2 ? format(lessonReviewDate2, "PPP", { locale: ja }) : <span>日付を選択</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={lessonReviewDate2}
                                        onSelect={setLessonReviewDate2}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="w-full space-y-2 mt-4">
                <Label htmlFor="overall-feedback">
                    {isPersonnelOfficeView ? "人事部フィードバック (最終承認)" : "全体的なフィードバック"}
                </Label>
                <Textarea 
                    id="overall-feedback" 
                    placeholder="この提出物に関する最終コメントを記入してください..." 
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                />
            </div>
        </div>
        <div className="flex justify-end w-full">
            <Button onClick={handleSubmitReview} disabled={isSubmitting} size="lg">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
                {isSubmitting ? "送信中..." : isPersonnelOfficeView ? "最終承認して完了" : "レビューを送信"}
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
