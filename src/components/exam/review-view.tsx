"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Exam, Answer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return answers.find(a => a.questionId === questionId)?.value || "No answer provided.";
  }

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Submission Successful!",
        description: "Your exam has been submitted for grading.",
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
        </CardHeader>
        <CardContent className="space-y-6">
          {exam.questions.map((question) => (
            <div key={question.id} className="rounded-lg border p-4">
              <p className="font-semibold">{question.id}. {question.text}</p>
              <p className="mt-2 text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                {getAnswerForQuestion(question.id)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft />
          Go Back & Edit
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} size="lg">
          {isLoading ? "Submitting..." : "Submit Final Answers"}
          {!isLoading && <Send />}
        </Button>
      </div>
    </div>
  );
}
