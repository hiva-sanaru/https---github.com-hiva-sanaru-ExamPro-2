
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Loader2, Save } from 'lucide-react';
import type { Question } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: `new${questions.length + 1}`, text: '', type: 'descriptive', points: 10, timeLimit: 300, modelAnswer: '', options: [] }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === 'options') {
        (newQuestions[index] as any)[field] = value.split('\n');
    } else {
        (newQuestions[index] as any)[field] = value;
    }
    setQuestions(newQuestions);
  };
  
  const handleSaveExam = () => {
      setIsSaving(true);
      // Here you would typically save the exam data to your backend/database
      console.log({ title, duration, questions });
      setTimeout(() => {
          toast({ title: '試験が正常に保存されました！' });
          router.push('/admin/dashboard');
          setIsSaving(false);
      }, 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">新しい試験を作成</h1>
        <p className="text-muted-foreground">試験の詳細を入力し、問題を追加してください。</p>
      </div>

      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>試験詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="exam-title">試験タイトル</Label>
                    <Input id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 2024年下期 昇進試験" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="exam-duration">試験時間（分）</Label>
                    <Input id="exam-duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>問題リスト</CardTitle>
                <CardDescription>試験問題を作成・編集します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {questions.map((q, index) => (
                   <Card key={index} className="p-4">
                       <div className="flex justify-between items-start">
                           <div className="flex-grow space-y-2 pr-4">
                               <div className="space-y-2">
                                   <Label htmlFor={`q-text-${index}`}>問題文</Label>
                                   <Textarea id={`q-text-${index}`} value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)} placeholder={`問題 ${index + 1} の内容を記述...`} />
                               </div>
                                {q.type === 'multiple-choice' && (
                                  <div className="space-y-2">
                                      <Label htmlFor={`q-options-${index}`}>選択肢 (改行で区切る)</Label>
                                      <Textarea 
                                          id={`q-options-${index}`} 
                                          value={Array.isArray(q.options) ? q.options.join('\n') : ''} 
                                          onChange={(e) => handleQuestionChange(index, 'options', e.target.value)} 
                                          placeholder={'選択肢A\n選択肢B\n選択肢C'}
                                          rows={4}
                                      />
                                  </div>
                                )}
                                <div className="space-y-2">
                                   <Label htmlFor={`q-model-answer-${index}`}>模範解答</Label>
                                   <Textarea id={`q-model-answer-${index}`} value={q.modelAnswer} onChange={(e) => handleQuestionChange(index, 'modelAnswer', e.target.value)} placeholder={`問題 ${index + 1} の模範解答を記述...`} rows={3} />
                               </div>
                               <div className="flex gap-4">
                                    <div className="w-1/3 space-y-2">
                                       <Label htmlFor={`q-type-${index}`}>問題タイプ</Label>
                                       <Select value={q.type} onValueChange={(value) => handleQuestionChange(index, 'type', value)}>
                                            <SelectTrigger id={`q-type-${index}`}>
                                                <SelectValue placeholder="タイプを選択" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="descriptive">記述式</SelectItem>
                                                <SelectItem value="fill-in-the-blank">穴埋め</SelectItem>
                                                <SelectItem value="multiple-choice">選択式</SelectItem>
                                            </SelectContent>
                                        </Select>
                                   </div>
                                   <div className="w-1/3 space-y-2">
                                       <Label htmlFor={`q-points-${index}`}>配点</Label>
                                       <Input id={`q-points-${index}`} type="number" value={q.points} onChange={(e) => handleQuestionChange(index, 'points', Number(e.target.value))} placeholder="例: 10" />
                                   </div>
                                   <div className="w-1/3 space-y-2">
                                       <Label htmlFor={`q-time-${index}`}>制限時間(秒)</Label>
                                       <Input id={`q-time-${index}`} type="number" value={q.timeLimit} onChange={(e) => handleQuestionChange(index, 'timeLimit', Number(e.target.value))} placeholder="例: 300" />
                                   </div>
                               </div>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                       </div>
                   </Card>
               ))}
                <Button variant="outline" onClick={handleAddQuestion}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    問題を追加
                </Button>
            </CardContent>
        </Card>
      </div>

       <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSaveExam} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? "保存中..." : "試験を保存"}
            </Button>
        </div>
    </div>
  );
}
