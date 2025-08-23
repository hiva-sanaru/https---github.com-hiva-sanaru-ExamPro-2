
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Loader2, Save, CornerDownLeft } from 'lucide-react';
import type { Question, Exam } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addExam, getExam, updateExam } from '@/services/examService';
import { v4 as uuidv4 } from 'uuid';


export default function CreateExamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [examId, setExamId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('examId');
    if (id) {
      setExamId(id);
      const fetchExamData = async () => {
        try {
          const examData = await getExam(id);
          if (examData) {
            setTitle(examData.title);
            setDuration(examData.duration);
            // Ensure questions have unique IDs for the form key
            const questionsWithIds = examData.questions.map(q => ({...q, id: q.id || uuidv4()}));
            setQuestions(questionsWithIds);
          } else {
            toast({ title: "エラー", description: "試験が見つかりませんでした。", variant: "destructive" });
            router.push('/admin/dashboard');
          }
        } catch (error) {
          console.error("Failed to fetch exam", error);
          toast({ title: "エラー", description: "試験データの読み込みに失敗しました。", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchExamData();
    } else {
      setIsLoading(false);
    }
  }, [searchParams, router, toast]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: uuidv4(), text: '', type: 'descriptive', points: 10, timeLimit: 300, modelAnswer: '', options: [], subQuestions: [] }]);
  };
  
  const handleAddSubQuestion = (parentIndex: number) => {
    const newQuestions = [...questions];
    const parentQuestion = newQuestions[parentIndex];
    if (!parentQuestion.subQuestions) {
        parentQuestion.subQuestions = [];
    }
    parentQuestion.subQuestions.push({
        id: uuidv4(),
        text: '',
        type: 'descriptive',
        points: 5,
        modelAnswer: '',
    });
    setQuestions(newQuestions);
  }


  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleRemoveSubQuestion = (parentIndex: number, subIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[parentIndex].subQuestions?.splice(subIndex, 1);
    setQuestions(newQuestions);
  }

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    const question = newQuestions[index] as Question;
    if (field === 'options') {
        question[field] = value.split('\n');
    } else {
        (question as any)[field] = value;
    }
    setQuestions(newQuestions);
  };
  
  const handleSubQuestionChange = (parentIndex: number, subIndex: number, field: keyof Question, value: any) => {
      const newQuestions = [...questions];
      const subQuestion = newQuestions[parentIndex].subQuestions?.[subIndex] as Question;
      if (subQuestion) {
          (subQuestion as any)[field] = value;
          setQuestions(newQuestions);
      }
  }
  
  const handleSaveExam = async () => {
      setIsSaving(true);
      const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
      
      const examData: Omit<Exam, 'id'> = {
        title,
        duration,
        questions: questions as Question[],
        totalPoints,
        status: 'Draft', // Default status
      };

      try {
        if(examId) {
          await updateExam(examId, examData);
          toast({ title: '試験が正常に更新されました！' });
        } else {
          await addExam(examData);
          toast({ title: '試験が正常に作成されました！' });
        }
        router.push('/admin/dashboard');
      } catch(error) {
        console.error("Failed to save exam", error);
        toast({ title: "保存エラー", description: "試験の保存中にエラーが発生しました。", variant: "destructive" });
        setIsSaving(false);
      }
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{examId ? '試験を編集' : '新しい試験を作成'}</h1>
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
                   <Card key={q.id || index} className="p-4 bg-muted/30">
                       <div className="flex justify-between items-start">
                           <div className="flex-grow space-y-4 pr-4">
                               <div className="space-y-2">
                                   <Label htmlFor={`q-text-${index}`}>問題文 {index + 1}</Label>
                                   <Textarea id={`q-text-${index}`} value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)} placeholder={`問題 ${index + 1} の内容を記述...`} />
                               </div>
                                {q.type === 'selection' && (
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
                                                <SelectItem value="selection">選択式</SelectItem>
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

                               {/* Sub Questions */}
                               {q.subQuestions && q.subQuestions.length > 0 && (
                                   <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                                       <h4 className="font-bold text-md text-muted-foreground pt-2">サブ問題</h4>
                                       {q.subQuestions.map((subQ, subIndex) => (
                                           <Card key={subQ.id || subIndex} className="p-4 bg-background">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-grow space-y-4 pr-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`subq-text-${index}-${subIndex}`}>サブ問題文 {subIndex + 1}</Label>
                                                            <Textarea id={`subq-text-${index}-${subIndex}`} value={subQ.text} onChange={(e) => handleSubQuestionChange(index, subIndex, 'text', e.target.value)} placeholder={`サブ問題 ${subIndex + 1} の内容...`} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`subq-model-answer-${index}-${subIndex}`}>模範解答</Label>
                                                            <Textarea id={`subq-model-answer-${index}-${subIndex}`} value={subQ.modelAnswer} onChange={(e) => handleSubQuestionChange(index, subIndex, 'modelAnswer', e.target.value)} placeholder={`サブ問題 ${subIndex + 1} の模範解答...`} rows={2} />
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="w-1/2 space-y-2">
                                                                <Label htmlFor={`subq-type-${index}-${subIndex}`}>問題タイプ</Label>
                                                                <Select value={subQ.type} onValueChange={(value) => handleSubQuestionChange(index, subIndex, 'type', value)}>
                                                                    <SelectTrigger id={`subq-type-${index}-${subIndex}`}>
                                                                        <SelectValue placeholder="タイプを選択" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="descriptive">記述式</SelectItem>
                                                                        <SelectItem value="fill-in-the-blank">穴埋め</SelectItem>
                                                                        <SelectItem value="selection">選択式</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="w-1/2 space-y-2">
                                                                <Label htmlFor={`subq-points-${index}-${subIndex}`}>配点</Label>
                                                                <Input id={`subq-points-${index}-${subIndex}`} type="number" value={subQ.points} onChange={(e) => handleSubQuestionChange(index, subIndex, 'points', Number(e.target.value))} placeholder="例: 5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSubQuestion(index, subIndex)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </Card>
                                       ))}
                                   </div>
                               )}
                               <Button variant="outline" size="sm" onClick={() => handleAddSubQuestion(index)}>
                                   <CornerDownLeft className="mr-2 h-4 w-4" />
                                   サブ問題を追加
                               </Button>

                           </div>
                           <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(index)}>
                                <Trash2 className="h-5 w-5 text-destructive" />
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
