"use client";

import { useState } from "react";
import { gradeAnswer } from "@/ai/flows/grade-answer";
import { useToast } from "@/hooks/use-toast";
import type { Exam, Submission, Question } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Wand2, User, Check, GitCommitHorizontal, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";

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

export function ReviewPanel({ exam, submission, reviewerRole }: ReviewPanelProps) {
  const { toast } = useToast();
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAnswerForQuestion = (questionId: string) => {
    return submission.answers.find((a) => a.questionId === questionId)?.value || "N/A";
  };

  const handleGradeQuestion = async (question: Question) => {
    const answerText = getAnswerForQuestion(question.id);
    if (!answerText || answerText === "N/A") {
      toast({ title: "この問題には回答がありません。", variant: "destructive" });
      return;
    }

    setGradingResults((prev) => [
      ...prev.filter((r) => r.questionId !== question.id),
      { questionId: question.id, score: 0, justification: "", isLoading: true },
    ]);

    try {
      const result = await gradeAnswer({
        answerText,
        scoringRubric: `問題: ${question.text} (最大配点: ${question.points})`,
      });
      setGradingResults((prev) =>
        prev.map((r) =>
          r.questionId === question.id
            ? { ...r, score: result.score, justification: result.justification, isLoading: false }
            : r
        )
      );
      toast({ title: `Q${question.id}のAI採点が完了しました` });
    } catch (error) {
      console.error(error);
      toast({ title: "AI採点に失敗しました", description: "AIから応答を取得できませんでした。", variant: "destructive" });
      setGradingResults((prev) => prev.filter((r) => r.questionId !== question.id));
    }
  };

  const handleSubmitReview = () => {
    setIsSubmitting(true);
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
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {exam.questions.map((question, index) => {
            const result = gradingResults.find((r) => r.questionId === question.id);
            return (
              <AccordionItem value={`item-${index}`} key={question.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between w-full pr-4 items-center">
                    <span className="font-semibold text-left">問題 {index + 1}: {question.text}</span>
                    {result && !result.isLoading && <Badge variant="secondary">AI採点済み</Badge>}
                    {result?.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Button size="sm" onClick={() => handleGradeQuestion(question)} disabled={result?.isLoading}>
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
                        <Input id={`score-${question.id}`} type="number" placeholder="スコア" className="w-24" max={question.points} />
                        <Textarea id={`feedback-${question.id}`} placeholder={`問題${index+1}のスコアの根拠を記入してください...`} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
      <CardFooter className="flex flex-col items-end gap-4">
        <div className="w-full space-y-2">
            <Label htmlFor="overall-feedback">全体的なフィードバック</Label>
            <Textarea 
                id="overall-feedback" 
                placeholder="この提出物に関する最終コメントを記入してください..." 
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
            />
        </div>
        <Button onClick={handleSubmitReview} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
            {isSubmitting ? "送信中..." : "レビューを送信"}
        </Button>
      </CardFooter>
    </Card>
  );
}
