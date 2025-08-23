
export type UserRole = 'system_administrator' | 'hq_administrator' | 'examinee';

export interface User {
  id: string;
  name: string;
  employeeId: string;
  role: UserRole;
  avatarUrl: string;
  headquarters?: string;
}

export type QuestionType = 'descriptive' | 'fill-in-the-blank' | 'multiple-choice';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  timeLimit?: number; // in seconds
  options?: string[]; // for multiple-choice
  modelAnswer?: string; // for grading
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

export interface Grade {
    score: number;
    justification: string;
    reviewer: string;
    scores?: { [questionId: string]: number }; // Individual question scores
}

export interface Submission {
  id: string;
  examId: string;
  examineeId: string;
  examineeHeadquarters?: string;
  submittedAt: Date;
  answers: Answer[];
  status: 'In Progress' | 'Submitted' | 'Grading' | 'Completed';
  hqGrade?: Grade;
  poGrade?: Grade;
  finalScore?: number;
  lessonReviewDate1?: Date;
  lessonReviewDate2?: Date;
}

export interface Headquarters {
  code: string;
  name: string;
}
