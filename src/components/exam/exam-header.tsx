"use client";

import { useState, useEffect } from "react";
import { Timer, BookAIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ExamHeaderProps {
  title: string;
  duration: number; // in minutes
}

export function ExamHeader({ title, duration }: ExamHeaderProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
            <Timer className="h-4 w-4 text-primary" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <Button variant="outline" size="sm">一時停止</Button>
        </div>
      </div>
    </header>
  );
}
