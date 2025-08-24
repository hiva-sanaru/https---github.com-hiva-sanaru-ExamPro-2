
"use client";

import { Timer, Clock, BookAIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface ExamHeaderProps {
  title: string;
  timeLeft: number; // in seconds
  questionTimeLeft?: number | null; // in seconds for current question
}

export function ExamHeader({ title, timeLeft, questionTimeLeft }: ExamHeaderProps) {

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <BookAIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold font-headline md:text-xl">{title}</h1>
        </div>
        <div className="flex items-center gap-6">
          {questionTimeLeft != null && (
            <div className="flex items-center gap-2 text-destructive">
               <Clock className="h-5 w-5" />
               <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-destructive/80">小問残り時間</span>
                    <span className="text-xl font-bold tracking-wider font-code">
                        {formatTime(questionTimeLeft)}
                    </span>
               </div>
            </div>
          )}
          
          <Separator orientation="vertical" className="h-8" />

          <div className="flex items-center gap-2 text-primary">
             <Timer className="h-5 w-5" />
             <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-primary/80">試験残り時間</span>
                <span className="text-xl font-bold tracking-wider font-code">
                    {formatTime(timeLeft)}
                </span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}
