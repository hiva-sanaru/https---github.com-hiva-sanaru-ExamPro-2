
"use client";

import { useState, useEffect } from "react";
import type { Question, Answer } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface QuestionCardProps {
    question: Question;
    index: number;
    answer: Answer | undefined;
    onAnswerChange: (questionId: string, value: string) => void;
    onTimeUp: () => void;
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

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

export const QuestionCard = ({ question, index, answer, onAnswerChange, onTimeUp }: QuestionCardProps) => {
    const [timeLeft, setTimeLeft] = useState(question.timeLimit);
    
    useEffect(() => {
        // Reset timer when question changes
        setTimeLeft(question.timeLimit);
    }, [question.timeLimit]);

    useEffect(() => {
        if (timeLeft === undefined) return;
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== undefined ? prev - 1 : undefined));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const handleSubAnswerChange = (subQuestionId: string, value: string) => {
        // This part would need a more complex state management, for now we just log it
        console.log(`Sub-question ${subQuestionId} answer changed to: ${value}`);
    }
    
    const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-xl">問題 {index + 1}</CardTitle>
                    <p className="text-muted-foreground">{question.points} 点</p>
                </div>
                {timeLeft !== undefined && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-semibold">残り時間: {formatTime(timeLeft)}</span>
                    </div>
                )}
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
                                    rows={3}
                                    className="mt-2"
                                    onChange={(e) => handleSubAnswerChange(subQ.id!, e.target.value)}
                                    placeholder="答えを入力..."
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
