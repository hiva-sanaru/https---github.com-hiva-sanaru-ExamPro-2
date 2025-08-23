export type UserRole = 'administrator' | 'examinee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export type QuestionType = 'descriptive' | 'fill-in-the-blank' | 'multiple-choice';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[]; // for multiple-choice
  subQuestions?: Question[];
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  totalPoints: number;
  status: 'Draft' | 'Published' | 'Archived';
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: string;
  subAnswers?: Answer[];
}

export interface Submission {
  id: string;
  examId: string;
  examineeId: string;
  submittedAt: Date;
  answers: Answer[];
  status: 'In Progress' | 'Submitted' | 'Grading' | 'Completed';
  hqGrade?: { score: number; justification: string; reviewer: string };
  poGrade?: { score: number; justification: string; reviewer: string };
  finalScore?: number;
}
