import type { Exam, Submission } from './types';

export const mockExams: Exam[] = [
  {
    id: '1',
    title: '2024年 年次業績評価試験',
    duration: 90,
    totalPoints: 100,
    status: 'Published',
    questions: [
      {
        id: 'q1',
        text: 'リーダーシップスキルを発揮した状況を説明してください。その結果はどうでしたか？',
        type: 'descriptive',
        points: 20,
        timeLimit: 600, // 10 minutes
      },
      {
        id: 'q2',
        text: '当社の価値観は、誠実さ、革新、そして_____です。',
        type: 'fill-in-the-blank',
        points: 10,
        timeLimit: 120, // 2 minutes
      },
      {
        id: 'q3',
        text: '新しい第3四半期のプロジェクトイニシアチブの主な目標は何ですか？',
        type: 'multiple-choice',
        points: 15,
        timeLimit: 180, // 3 minutes
        options: [
          '市場シェアを10%増加させる',
          '運用コストを15%削減する',
          '顧客満足度スコアを向上させる',
          '新製品ラインを立ち上げる',
        ],
      },
      {
        id: 'q4',
        text: '新しいコンプライアンス規制（GDPR）と、それが当社のデータ処理ポリシーに与える影響について説明してください。',
        type: 'descriptive',
        points: 25,
        timeLimit: 900, // 15 minutes
        subQuestions: [
            { id: 'q4a', text: '不遵守の場合の罰則は何ですか？', type: 'descriptive', points: 10 },
            { id: 'q4b', text: '顧客データの保存にどのように影響しますか？', type: 'descriptive', points: 15 }
        ]
      },
      {
        id: 'q5',
        text: 'プロジェクトコードネーム「フェニックス」は、_____までに完了する予定です。',
        type: 'fill-in-the-blank',
        points: 10,
        timeLimit: 120, // 2 minutes
      }
    ],
  },
  {
    id: '2',
    title: '新入社員オンボーディング評価',
    duration: 45,
    totalPoints: 50,
    status: 'Published',
    questions: [
      {
        id: 'nh1',
        text: 'あなたの役割でやり取りする主要な3つの部門を挙げてください。',
        type: 'descriptive',
        points: 15,
        timeLimit: 300,
      },
      {
        id: 'nh2',
        text: '会社は_____年に設立されました。',
        type: 'fill-in-the-blank',
        points: 10,
        timeLimit: 60,
      },
    ],
  },
  {
    id: '3',
    title: 'サイバーセキュリティのベストプラクティス',
    duration: 60,
    totalPoints: 100,
    status: 'Draft',
    questions: [],
  },
];

export const mockSubmissions: Submission[] = [
    {
        id: 'sub1',
        examId: '1',
        examineeId: 'user2',
        examineeHeadquarters: 'Tokyo',
        submittedAt: new Date('2024-07-20T10:30:00Z'),
        status: 'Grading',
        answers: [
            { questionId: 'q1', value: '私は部門横断チームを率いて、予定より早く新機能をリリースし、その結果、ユーザーエンゲージメントが15%向上しました。' },
            { questionId: 'q2', value: 'チームワーク' },
            { questionId: 'q3', value: '運用コストを15%削減する' },
            { 
                questionId: 'q4', 
                value: 'GDPRは、ヨーロッパのデータ保護規制であり、データ利用についてより透明性を求めるものです。',
                subAnswers: [
                    { questionId: 'q4a', value: '罰金は、全世界の年間売上高の最大4%になる可能性があります。' },
                    { questionId: 'q4b', value: '明示的な同意とデータ暗号化が必要です。' }
                ]
            },
            { questionId: 'q5', value: '2024年第4四半期' },
        ]
    }
];
