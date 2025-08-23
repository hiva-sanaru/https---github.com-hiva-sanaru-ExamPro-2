
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateExamQuestions } from '@/ai/flows/generate-exam-questions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Wand2, Loader2, Save } from 'lucide-react';
import type { Question } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: `new${questions.length + 1}`, text: '', type: 'descriptive', points: 10 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };
  
  const handleGenerateQuestions = async () => {
    if (!aiPrompt) {
        toast({ title: 'AIプロンプトを入力してください', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateExamQuestions({ prompt: aiPrompt });
        
        // This is a simplified parser. A real implementation would need a more robust way
        // to parse the AI's output into structured question data.
        const generatedQuestions: Partial<Question>[] = result.questions.split('\n\n').map((q, i) => {
            const lines = q.split('\n');
            return {
                id: `ai${i}`,
                text: lines[0]?.replace(/^[0-9]\. /, ''),
                type: 'descriptive',
                points: 10
            }
        }).filter(q => q.text);

        setQuestions(prev => [...prev, ...generatedQuestions]);
        toast({ title: 'AIが問題を生成しました！' });

    } catch (error) {
        console.error(error);
        toast({ title: 'AI問題生成に失敗しました', description: 'AIからの応答を取得できませんでした。', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                                   <Label htmlFor={`q-text-${index}`}>問題文</Label>
                                   <Textarea id={`q-text-${index}`} value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)} placeholder={`問題 ${index + 1} の内容を記述...`} />
                                   <div className="flex gap-4">
                                       <div className="w-1/2 space-y-2">
                                           <Label htmlFor={`q-type-${index}`}>問題タイプ</Label>
                                           <Select value={q.type} onValueChange={(value) => handleQuestionChange(index, 'type', value)}>
                                                <SelectTrigger id={`q-type-${index}`}>
                                                    <SelectValue placeholder="タイプを選択" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="descriptive">記述式</SelectItem>
                                                    <SelectItem value="fill-in-the-blank">穴埋め</SelectItem>
                                                    <SelectItem value="multiple-choice">多肢選択式</SelectItem>
                                                </SelectContent>
                                            </Select>
                                       </div>
                                       <div className="w-1/2 space-y-2">
                                           <Label htmlFor={`q-points-${index}`}>配点</Label>
                                           <Input id={`q-points-${index}`} type="number" value={q.points} onChange={(e) => handleQuestionChange(index, 'points', Number(e.target.value))} placeholder="例: 10" />
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

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="text-primary" />
                        AIアシスタント
                    </CardTitle>
                    <CardDescription>プロンプトに基づいてAIに問題を作成させます。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ai-prompt">プロンプト</Label>
                        <Textarea 
                            id="ai-prompt"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="例: 「企業の社会的責任(CSR)に関する記述式の問題を5問作成してください。」"
                            rows={6}
                        />
                    </div>
                     <Button onClick={handleGenerateQuestions} disabled={isGenerating} className="w-full">
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isGenerating ? "生成中..." : "AIで問題を生成"}
                    </Button>
                </CardContent>
            </Card>
        </div>
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
