
"use client";

import { Timer, BookAIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ExamHeaderProps {
  title: string;
  timeLeft: number; // in seconds
}

export function ExamHeader({ title, timeLeft }: ExamHeaderProps) {

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-primary border">
            <Timer className="h-5 w-5" />
            <span className="text-xl font-bold tracking-wider font-code">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
