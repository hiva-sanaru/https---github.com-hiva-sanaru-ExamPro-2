import type { Exam, Submission } from './types';

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Annual Performance Review Exam 2024',
    duration: 90,
    totalPoints: 100,
    status: 'Published',
    questions: [
      {
        id: 'q1',
        text: 'Describe a situation where you demonstrated leadership skills. What was the outcome?',
        type: 'descriptive',
        points: 20,
      },
      {
        id: 'q2',
        text: 'Our company values are Integrity, Innovation, and _____.',
        type: 'fill-in-the-blank',
        points: 10,
      },
      {
        id: 'q3',
        text: 'What is the primary goal of the new Q3 project initiative?',
        type: 'multiple-choice',
        points: 15,
        options: [
          'Increase market share by 10%',
          'Reduce operational costs by 15%',
          'Enhance customer satisfaction scores',
          'Launch a new product line',
        ],
      },
      {
        id: 'q4',
        text: 'Explain the new compliance regulation (GDPR) and its impact on our data handling policies.',
        type: 'descriptive',
        points: 25,
        subQuestions: [
            { id: 'q4a', text: 'What are the penalties for non-compliance?', type: 'descriptive', points: 10 },
            { id: 'q4b', text: 'How does it affect customer data storage?', type: 'descriptive', points: 15 }
        ]
      },
      {
        id: 'q5',
        text: 'The project codename "Phoenix" is expected to be completed by _____.',
        type: 'fill-in-the-blank',
        points: 10,
      }
    ],
  },
  {
    id: '2',
    title: 'New Hire Onboarding Assessment',
    duration: 45,
    totalPoints: 50,
    status: 'Published',
    questions: [
      {
        id: 'nh1',
        text: 'List the three main departments you will be interacting with in your role.',
        type: 'descriptive',
        points: 15,
      },
      {
        id: 'nh2',
        text: 'The company was founded in the year _____.',
        type: 'fill-in-the-blank',
        points: 10,
      },
    ],
  },
  {
    id: '3',
    title: 'Cybersecurity Best Practices',
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
        submittedAt: new Date('2024-07-20T10:30:00Z'),
        status: 'Grading',
        answers: [
            { questionId: 'q1', value: 'I led a cross-functional team to launch a new feature ahead of schedule, resulting in a 15% increase in user engagement.' },
            { questionId: 'q2', value: 'Teamwork' },
            { questionId: 'q3', value: 'Reduce operational costs by 15%' },
            { 
                questionId: 'q4', 
                value: 'GDPR is a European data protection regulation that requires us to be more transparent about data usage.',
                subAnswers: [
                    { questionId: 'q4a', value: 'Fines can be up to 4% of global annual turnover.' },
                    { questionId: 'q4b', value: 'It requires explicit consent and data encryption.' }
                ]
            },
            { questionId: 'q5', value: 'Q4 2024' },
        ]
    }
];
