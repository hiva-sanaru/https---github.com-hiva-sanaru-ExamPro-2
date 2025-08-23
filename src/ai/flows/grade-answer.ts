'use server';
/**
 * @fileOverview AI-powered automatic grading tool.
 *
 * - gradeAnswer - A function that handles the grading of examinee answers based on a rubric.
 * - GradeAnswerInput - The input type for the gradeAnswer function.
 * - GradeAnswerOutput - The return type for the gradeAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeAnswerInputSchema = z.object({
  questionText: z.string().describe('The text of the exam question.'),
  modelAnswer: z.string().describe('The model answer for the exam question.'),
  answerText: z.string().describe('The text of the examinee answer.'),
  points: z.number().describe('The maximum points for the question.'),
});
export type GradeAnswerInput = z.infer<typeof GradeAnswerInputSchema>;

const GradeAnswerOutputSchema = z.object({
  score: z.number().describe('The score assigned to the answer based on the rubric.'),
  justification: z
    .string()
    .describe('The justification for the assigned score based on the rubric.'),
});
export type GradeAnswerOutput = z.infer<typeof GradeAnswerOutputSchema>;

export async function gradeAnswer(input: GradeAnswerInput): Promise<GradeAnswerOutput> {
  return gradeAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeAnswerPrompt',
  input: {schema: GradeAnswerInputSchema},
  output: {schema: GradeAnswerOutputSchema},
  prompt: `あなたはAI採点アシスタントです。提供された模範解答に基づいて、以下の解答を採点してください。

問題:
{{questionText}}

満点:
{{points}}

模範解答:
{{modelAnswer}}

受験者の解答:
{{answerText}}

スコアと、そのスコアに至った根拠を日本語で提供してください。
スコアは0から満点の間の整数でなければなりません。
根拠は、受験者の解答と模範解答を比較し、割り当てられたスコアの理由を明確に説明する必要があります。`,
});

const gradeAnswerFlow = ai.defineFlow(
  {
    name: 'gradeAnswerFlow',
    inputSchema: GradeAnswerInputSchema,
    outputSchema: GradeAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
