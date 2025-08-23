
'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

interface Headquarters {
  code: string;
  name: string;
}

export default function HeadquartersPage() {
  const { toast } = useToast();
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse<Headquarters>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.filter(item => item.code && item.name);
        setHeadquarters(prev => [...prev, ...parsedData]);
        toast({
          title: 'CSVが正常にインポートされました',
          description: `${parsedData.length}件の本部が追加されました。`,
        });
        setIsLoading(false);
      },
      error: (error) => {
        toast({
          title: 'CSVの解析中にエラーが発生しました',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
      },
    });

    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveHeadquarters = (code: string) => {
    setHeadquarters(headquarters.filter(hq => hq.code !== code));
    toast({
        title: '本部が削除されました',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">本部管理</h1>
        <p className="text-muted-foreground">CSVファイルをインポートして、本部情報を一括で登録・管理します。</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-xl">本部リスト</CardTitle>
                <CardDescription>
                    CSVファイルには 'code' と 'name' のヘッダーを含めてください。
                </CardDescription>
            </div>
            <div>
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv"
                />
                <Button onClick={handleImportClick} disabled={isLoading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isLoading ? 'インポート中...' : 'CSVをインポート'}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary/90">
                        <TableHead className="text-primary-foreground">本部コード</TableHead>
                        <TableHead className="text-primary-foreground">本部名</TableHead>
                        <TableHead className="text-right text-primary-foreground">アクション</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {headquarters.length > 0 ? (
                        headquarters.map((hq) => (
                            <TableRow key={hq.code}>
                                <TableCell className="font-medium">{hq.code}</TableCell>
                                <TableCell>{hq.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveHeadquarters(hq.code)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">削除</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                データがありません。CSVをインポートしてください。
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
