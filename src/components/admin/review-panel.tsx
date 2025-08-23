
"use client";

import { useState, useMemo } from "react";
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
import { Bot, Wand2, User, Check, GitCommitHorizontal, Loader2, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
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
  const [lessonReviewDate1, setLessonReviewDate1] = useState<Date>();
  const [lessonReviewDate2, setLessonReviewDate2] = useState<Date>();

  const totalScore = useMemo(() => {
    return Object.values(manualScores).reduce((acc, score) => acc + (score || 0), 0);
  }, [manualScores]);
  
  const isPassed = totalScore >= 80;

  const handleManualScoreChange = (questionId: string, score: string) => {
    const newScore = Number(score);
    setManualScores(prev => ({...prev, [questionId]: newScore}));
  }

  const getAnswerForQuestion = (questionId: string) => {
    return submission.answers.find((a) => a.questionId === questionId)?.value || "N/A";
  };

  const handleGradeQuestion = async (question: Question) => {
    const answerText = getAnswerForQuestion(question.id);
    if (!answerText || answerText === "N/A") {
      toast({ title: "この問題には回答がありません。", variant: "destructive" });
      return;
    }
    
    if (!question.modelAnswer) {
      toast({ title: "この問題には模範解答が登録されていません。", variant: "destructive" });
      return;
    }

    setGradingResults((prev) => [
      ...prev.filter((r) => r.questionId !== question.id),
      { questionId: question.id, score: 0, justification: "", isLoading: true },
    ]);

    try {
      const result = await gradeAnswer({
        questionText: question.text,
        modelAnswer: question.modelAnswer,
        answerText,
        points: question.points,
      });
      setGradingResults((prev) =>
        prev.map((r) =>
          r.questionId === question.id
            ? { ...r, score: result.score, justification: result.justification, isLoading: false }
            : r
        )
      );
      // Automatically set the manual score to the AI-graded score
      handleManualScoreChange(question.id, result.score.toString());
      toast({ title: `Q${question.id}のAI採点が完了しました` });
    } catch (error) {
      console.error(error);
      toast({ title: "AI採点に失敗しました", description: "AIから応答を取得できませんでした。", variant: "destructive" });
      setGradingResults((prev) => prev.filter((r) => r.questionId !== question.id));
    }
  };

  const handleSubmitReview = () => {
    setIsSubmitting(true);
    // In a real app, you would save the data to your backend here.
    // This includes: manualScores, totalScore, overallFeedback, and lessonReviewDates if applicable.
    console.log({
        reviewerRole,
        submissionId: submission.id,
        scores: manualScores,
        totalScore,
        feedback: overallFeedback,
        lessonReviewDate1,
        lessonReviewDate2
    });

    setTimeout(() => {
        toast({ title: `${reviewerRole}のレビューが正常に送信されました！` });
        setIsSubmitting(false);
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{reviewerRole}レビュー</CardTitle>
        <CardDescription>
          受験者の回答を確認し、AI採点機能を使用して、最終評価を入力してください。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {exam.questions.map((question, index) => {
          const result = gradingResults.find((r) => r.questionId === question.id);
          return (
            <Card key={question.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                    <div className="flex justify-between w-full items-center">
                        <CardTitle className="text-lg font-semibold text-left">問題 {index + 1}: {question.text} ({question.points}点)</CardTitle>
                        <div className="flex items-center gap-2">
                            {manualScores[question.id] !== undefined && <Badge>{manualScores[question.id]}点</Badge>}
                            {result && !result.isLoading && <Badge variant="secondary">AI採点済み</Badge>}
                            {result?.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                                <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2">
                                    <p><strong>スコア:</strong> {result.score}/{question.points}</p>
                                    <p><strong>根拠:</strong> {result.justification}</p>
                                </div>
                            ) : (
                                <div className="p-3 rounded-md bg-muted/50 border border-dashed flex items-center justify-center min-h-[100px]">
                                    <Button size="sm" onClick={() => handleGradeQuestion(question)} disabled={result?.isLoading || !question.modelAnswer}>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        {result?.isLoading ? "採点中..." : "AIで採点"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor={`feedback-${question.id}`}>あなたの評価</Label>
                        <div className="flex items-start gap-2">
                            <Input 
                                id={`score-${question.id}`} 
                                type="number" 
                                placeholder="スコア" 
                                className="w-24" 
                                max={question.points}
                                value={manualScores[question.id] || ''}
                                onChange={(e) => handleManualScoreChange(question.id, e.target.value)}
                            />
                            <Textarea id={`feedback-${question.id}`} placeholder={`問題${index+1}のスコアの根拠を記入してください...`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-headline">最終評価</h3>
                <div className="text-2xl font-bold">
                    合計スコア: {totalScore} / {exam.totalPoints}
                </div>
            </div>

            {isPassed && (
                 <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
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
                <Label htmlFor="overall-feedback">全体的なフィードバック</Label>
                <Textarea 
                    id="overall-feedback" 
                    placeholder="この提出物に関する最終コメントを記入してください..." 
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                />
            </div>
        </div>
        <div className="flex justify-end w-full">
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
                {isSubmitting ? "送信中..." : "レビューを送信"}
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

    