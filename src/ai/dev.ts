import { config } from 'dotenv';
config();

import '@/ai/flows/grade-answer.ts';
import '@/ai/flows/generate-exam-questions.ts';
import '@/ai/flows/summarize-answer-feedback.ts';