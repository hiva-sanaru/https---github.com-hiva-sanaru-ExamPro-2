
"use client";

import { Fragment } from "react";
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
    onAnswerChange: (questionId: string, value: string | Answer[]) => void;
}

const renderFillInTheBlank = (
  text: string,
  value: string,
  onChange: (value: string) => void
) => {
  const parts = text.split('___');
  if (parts.length <= 1) {
    return (
const renderFillInTheBlank = (
  text: string,
  value: string,
  onChange: (value: string) => void
) => {
  const parts = text.split('___');
  if (parts.length <= 1) {
    return (
      <span className="inline-block border-b border-current min-w-[6ch] px-1 bg-transparent">
        <Input
          placeholder="空欄を埋めてください..."
          className="bg-transparent border-none focus:ring-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
    );
  }
  return (
    <p
      className="text-lg whitespace-pre-wrap"
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange((e.currentTarget as HTMLElement).innerText)}
    >
      {parts.map((part, index) => (
        <Fragment key={index}>
          <span contentEditable={false}>{part}</span>
          {index < parts.length - 1 && (
            <span className="inline-block border-b border-current min-w-[6ch] px-1" />
          )}
        </Fragment>
      ))}
    </p>
  );
};

export const QuestionCard = ({ question, index, answer, onAnswerChange }: QuestionCardProps) => {
    
    const handleSubAnswerChange = (subQuestionId: string, value: string) => {
        const currentSubAnswers = answer?.subAnswers || [];
        const existingAnswerIndex = currentSubAnswers.findIndex(a => a.questionId === subQuestionId);

        let newSubAnswers;
        if (existingAnswerIndex > -1) {
            newSubAnswers = currentSubAnswers.map((a, i) => 
                i === existingAnswerIndex ? { ...a, value } : a
            );
        } else {
            newSubAnswers = [...currentSubAnswers, { questionId: subQuestionId, value }];
        }
        onAnswerChange(question.id!, newSubAnswers);
    }

    const getSubAnswerValue = (subQuestionId: string) => {
        return answer?.subAnswers?.find(a => a.questionId === subQuestionId)?.value || '';
    }
    
    const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-xl">問題 {index + 1}</CardTitle>
                    <p className="text-muted-foreground">{question.points} 点</p>
                </div>
                {question.timeLimit && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-semibold">目安時間: {Math.floor(question.timeLimit / 60)}分</span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="text-lg whitespace-pre-wrap">{question.type !== 'fill-in-the-blank' ? question.text : ''}</div>
                
                {!hasSubQuestions && (
                    <>
                        {question.type === 'descriptive' && (
                            <Textarea 
                                placeholder="あなたの答え..." 
                                rows={8}
                                value={typeof answer?.value === 'string' ? answer.value : ''}
                                onChange={(e) => onAnswerChange(question.id!, e.target.value)}
                            />
                        )}
                        {question.type === 'fill-in-the-blank' && (
                            renderFillInTheBlank(question.text, typeof answer?.value === 'string' ? answer.value : '', (value) => onAnswerChange(question.id!, value))
                        )}
                        {question.type === 'selection' && question.options && (
                            <RadioGroup value={typeof answer?.value === 'string' ? answer.value : ''} onValueChange={(value) => onAnswerChange(question.id!, value)}>
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
                                    value={getSubAnswerValue(subQ.id!)}
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
