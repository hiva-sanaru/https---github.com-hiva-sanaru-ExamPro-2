
"use client";

import { useState, useEffect } from "react";
import type { Exam, Question, Answer } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { BookCheck } from "lucide-react";
import { ExamHeader } from "./exam-header";

interface ExamViewProps {
  exam: Exam;
}

const renderFillInTheBlank = (text: string, value: string, onChange: (value: string) => void) => {
    const parts = text.split('___');
    if (parts.length <= 1) {
        return <Input placeholder="空欄を埋めてください..." value={value} onChange={(e) => onChange(e.target.value)} />;
    }
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {parts.map((part, index) => (
                <div key={index} className="flex items-center gap-2">
                    {part && <p className="text-lg">{part}</p>}
                    {index < parts.length - 1 && (
                         <Input 
                            placeholder="回答" 
                            className="w-48"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

const QuestionCard = ({ question, index, answer, onAnswerChange }: { question: Question; index: number; answer: Answer | undefined, onAnswerChange: (questionId: string, value: string) => void }) => {
    
    const handleSubAnswerChange = (subQuestionId: string, value: string) => {
        // This part would need a more complex state management, for now we just log it
        console.log(`Sub-question ${subQuestionId} answer changed to: ${value}`);
    }
    
    const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-xl">問題 {index + 1}</CardTitle>
                <p className="text-muted-foreground">{question.points} 点</p>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                {question.type !== 'fill-in-the-blank' && <p className="text-lg whitespace-pre-wrap">{question.text}</p>}
                
                {!hasSubQuestions && (
                    <>
                        {question.type === 'descriptive' && (
                            <Textarea 
                                placeholder="あなたの答え..." 
                                rows={8}
                                value={answer?.value || ''}
                                onChange={(e) => onAnswerChange(question.id!, e.target.value)}
                            />
                        )}
                        {question.type === 'fill-in-the-blank' && (
                            renderFillInTheBlank(question.text, answer?.value || '', (value) => onAnswerChange(question.id!, value))
                        )}
                        {question.type === 'selection' && question.options && (
                            <RadioGroup value={answer?.value || ''} onValueChange={(value) => onAnswerChange(question.id!, value)}>
                                {question.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                                        <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </>
                )}


                {hasSubQuestions && (
                    <div className="space-y-4 border-l-2 border-primary/20 pl-4 ml-2">
                        {question.subQuestions?.map((subQ, subIndex) => (
                             <div key={subQ.id}>
                                <p className="font-medium">({subIndex + 1}) {subQ.text} ({subQ.points} 点)</p>
                                 <Textarea 
                                    placeholder="サブ問題へのあなたの答え..." 
                                    rows={3}
                                    className="mt-2"
                                    onChange={(e) => handleSubAnswerChange(subQ.id!, e.target.value)}
                                />
                             </div>
                        ))}
                    </div>
                )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">問題タイプ: {question.type === 'descriptive' ? '記述式' : question.type === 'fill-in-the-blank' ? '穴埋め' : '選択式'}</p>
            </CardFooter>
        </Card>
    )
}

export function ExamView({ exam }: ExamViewProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(exam.questions[0]);


  useEffect(() => {
    if (!api) return
    
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    setCurrentQuestion(exam.questions[api.selectedScrollSnap()]);

    api.on("select", () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex + 1)
      setCurrentQuestion(exam.questions[selectedIndex]);
    })
  }, [api, exam.questions])

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
  
  const handleReview = () => {
    localStorage.setItem(`exam-${exam.id}-answers`, JSON.stringify(answers));
    router.push(`/exam/${exam.id}/review`);
  };

  return (
    <>
      <ExamHeader title={exam.title} timeLimit={currentQuestion?.timeLimit || exam.duration * 60} />
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
            <div>
                <Progress value={progress} className="h-2" />
                <p className="text-right text-sm text-muted-foreground mt-2">
                    {count} 問中 {current} 問目
                </p>
            </div>
          
            <Carousel setApi={setApi} className="w-full">
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
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 md:-left-12" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 md:-right-12" />
            </Carousel>

          <div className="flex justify-end mt-8">
            <Button onClick={handleReview} size="lg" className="bg-accent hover:bg-accent/90">
              確認して提出
              <BookCheck className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

    