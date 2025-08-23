"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Exam, Answer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";

interface ReviewViewProps {
  exam: Exam;
}

export function ReviewView({ exam }: ReviewViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam-${exam.id}-answers`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [exam.id]);

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.value || "回答がありません。";
  }

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "提出完了！",
        description: "試験が採点のために提出されました。",
        variant: "default",
      });
      localStorage.removeItem(`exam-${exam.id}-answers`);
      router.push("/login"); // Or a submission confirmation page
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{exam.title}</CardTitle>
          <CardDescription>各質問への回答を確認してください。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {exam.questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="font-semibold text-card-foreground">問題 {index + 1}: {question.text}</p>
              <p className="mt-2 text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                {getAnswerForQuestion(question.id)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻って編集
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} size="lg">
          {isLoading ? "提出中..." : "最終回答を提出"}
          {!isLoading && <Send className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
