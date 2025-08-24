
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Exam, Question, Answer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "../ui/carousel";
import { BookCheck, ArrowRight, Loader2 } from "lucide-react";
import { ExamHeader } from "./exam-header";
import { QuestionCard } from "./question-card";
import { useToast } from "@/hooks/use-toast";

interface ExamViewProps {
  exam: Exam;
}

export function ExamView({ exam }: ExamViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Overall exam timer
  const [examTimeLeft, setExamTimeLeft] = useState(exam.duration * 60);

  // Per-question timer
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
  const [questionEndTime, setQuestionEndTime] = useState<number | null>(null);

  // Load answers and initialize timer from localStorage on mount
  useEffect(() => {
    try {
        const savedAnswers = localStorage.getItem(`exam-${exam.id}-answers`);
        if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
        }

        const examEndTime = localStorage.getItem(`exam-${exam.id}-endTime`);
        if (examEndTime) {
            const endTime = parseInt(examEndTime, 10);
            const remaining = Math.max(0, Math.floor((endTime - new Date().getTime()) / 1000));
            setExamTimeLeft(remaining);
        } else {
            const newEndTime = new Date().getTime() + exam.duration * 60 * 1000;
            localStorage.setItem(`exam-${exam.id}-endTime`, newEndTime.toString());
            setExamTimeLeft(exam.duration * 60);
        }

    } catch (error) {
        console.error("Failed to parse state from localStorage", error);
        // Clear broken data
        localStorage.removeItem(`exam-${exam.id}-answers`);
        localStorage.removeItem(`exam-${exam.id}-endTime`);
    } finally {
        setIsLoading(false);
    }
  }, [exam.id, exam.duration]);
  
  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`exam-${exam.id}-answers`, JSON.stringify(answers));
  }, [answers, exam.id]);

  const handleNext = useCallback(() => {
    if (api) {
        api.scrollNext();
    }
  }, [api])

  const handleReview = useCallback(() => {
    router.push(`/exam/${exam.id}/review`);
  }, [exam.id, router]);

  useEffect(() => {
    if (!api) return
    
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex + 1)
    })
  }, [api])

  useEffect(() => {
    const answeredCount = answers.filter(a => a.value && a.value.trim() !== '').length;
    setProgress((answeredCount / exam.questions.length) * 100);
  }, [answers, exam.questions.length])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const existingAnswer = prev.find((a) => a.questionId === questionId);
      if (existingAnswer) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, value } : a
        );
      }
      return [...prev, { questionId, value }];
    });
  };
  
  const handleTimeUp = useCallback(() => {
    // Time is up for the whole exam, force review and submission
    toast({
        title: "時間切れ！",
        description: "試験時間が終了しました。回答の確認ページに移動します。",
        variant: "destructive"
    });
    handleReview();
  }, [handleReview, toast]);

  // Exam-wide countdown timer logic
  useEffect(() => {
    if (isLoading) return; // Don't start timer until everything is loaded
    if (examTimeLeft <= 0) {
        handleTimeUp();
        return;
    }
    const timer = setInterval(() => {
        setExamTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examTimeLeft, handleTimeUp, isLoading]);

  // Per-question countdown timer logic
  useEffect(() => {
    if (isLoading || current <= 0) return;
    const qIndex = current - 1;
    const question = exam.questions[qIndex];
    if (!question.timeLimit) {
      setQuestionEndTime(null);
      setQuestionTimeLeft(null);
      return;
    }
    const key = `exam-${exam.id}-question-${question.id}-endTime`;
    try {
      const stored = localStorage.getItem(key);
      let endTime: number;
      if (stored) {
        endTime = parseInt(stored, 10);
      } else {
        endTime = Date.now() + question.timeLimit * 1000;
        localStorage.setItem(key, endTime.toString());
      }
      setQuestionEndTime(endTime);
    } catch (error) {
      console.error("Failed to parse question end time from localStorage", error);
      localStorage.removeItem(key);
      const endTime = Date.now() + question.timeLimit * 1000;
      localStorage.setItem(key, endTime.toString());
      setQuestionEndTime(endTime);
    }
  }, [current, isLoading, exam.id, exam.questions]);

  useEffect(() => {
    if (isLoading || questionEndTime == null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((questionEndTime - Date.now()) / 1000));
      setQuestionTimeLeft(remaining);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [questionEndTime, isLoading]);

  const handleQuestionTimeUp = useCallback(() => {
    toast({
      title: "時間切れ！",
      description: "この小問の制限時間が終了しました。次の問題に移動します。",
      variant: "destructive",
    });
    handleNext();
  }, [toast, handleNext]);

  useEffect(() => {
    if (questionTimeLeft === 0) {
      handleQuestionTimeUp();
    }
  }, [questionTimeLeft, handleQuestionTimeUp]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <>
      <ExamHeader
        title={exam.title}
        timeLeft={examTimeLeft}
        questionTimeLeft={questionTimeLeft}
      />
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
            <div>
                <Progress value={progress} className="h-2" />
                <p className="text-right text-sm text-muted-foreground mt-2">
                    {count} 問中 {current} 問目
                </p>
            </div>
          
            <Carousel setApi={setApi} className="w-full" opts={{
                watchDrag: false,
                watchKeys: false,
                draggable: false,
                align: "start"
            }}>
                <CarouselContent>
                    {exam.questions.map((question, index) => (
                        <CarouselItem key={question.id}>
                            <QuestionCard 
                                question={question}
                                index={index}
                                answer={answers.find(a => a.questionId === question.id)}
                                onAnswerChange={handleAnswerChange}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

          <div className="flex justify-end mt-8">
            {current < count ? (
                <Button onClick={handleNext} size="lg">
                    次の問題へ
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button onClick={handleReview} size="lg" className="bg-accent hover:bg-accent/90">
                    確認して提出
                    <BookCheck className="ml-2 h-4 w-4" />
                </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
