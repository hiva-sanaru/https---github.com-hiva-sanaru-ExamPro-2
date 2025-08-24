
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Exam, Answer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { addSubmission } from "@/services/submissionService";
import { findUserByEmployeeId } from "@/services/userService";
import type { User } from "@/lib/types";

interface ReviewViewProps {
  exam: Exam;
}

export function ReviewView({ exam }: ReviewViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam-${exam.id}-answers`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    
    const employeeId = localStorage.getItem('loggedInUserEmployeeId');
    if (employeeId) {
      findUserByEmployeeId(employeeId).then(setCurrentUser);
    }
  }, [exam.id]);

  const getAnswerForQuestion = (questionId: string): string => {
    const answer = answers.find(a => a.questionId === questionId);
    if (!answer) return "回答がありません。";
    
    if (answer.subAnswers && answer.subAnswers.length > 0) {
        return answer.subAnswers.map((sa, index) => 
            `(${index + 1}) ${sa.value || '未回答'}`
        ).join('\n');
    }

    if (typeof answer.value === 'string' && answer.value.trim()) {
        return answer.value;
    }

    return "回答がありません。";
  }

  const handleSubmit = async () => {
    if (!currentUser) {
        toast({
            title: "エラー",
            description: "ログインしているユーザーが見つかりません。再度ログインしてください。",
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);
    try {
        const submissionAnswers = answers.map(answer => {
            if(typeof answer.value !== 'string') {
                return { ...answer, value: '' }; // Set a default value for the main question if it was only subquestions
            }
            return answer;
        });

        await addSubmission({
            examId: exam.id,
            examineeId: currentUser.id,
            examineeHeadquarters: currentUser.headquarters,
            answers: submissionAnswers,
        });

        toast({
            title: "提出完了！",
            description: "試験が採点のために提出されました。",
            variant: "default",
        });
        localStorage.removeItem(`exam-${exam.id}-answers`);
        router.push("/"); // Redirect to dashboard after submission
    } catch (error) {
        console.error("Failed to submit exam:", error);
        toast({
            title: "提出エラー",
            description: "試験の提出中にエラーが発生しました。",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
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
              {question.subQuestions && question.subQuestions.length > 0 ? (
                 <div className="mt-2 space-y-2">
                    {question.subQuestions.map((subQ, subIndex) => (
                        <div key={subQ.id}>
                            <p className="font-medium text-sm text-muted-foreground">({subIndex + 1}) {subQ.text}</p>
                            <p className="mt-1 text-card-foreground whitespace-pre-wrap bg-muted p-2 rounded-md text-sm">
                                {answers.find(a => a.questionId === question.id)?.subAnswers?.find(sa => sa.questionId === subQ.id)?.value || "回答がありません。"}
                            </p>
                        </div>
                    ))}
                 </div>
              ) : (
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {getAnswerForQuestion(question.id!)}
                </p>
              )}
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
          {isLoading ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isLoading ? "提出中..." : "最終回答を提出"}
        </Button>
      </div>
    </div>
  );
}
