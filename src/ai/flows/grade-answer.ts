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
  prompt: `You are an AI grading assistant. Please grade the following answer based on the provided model answer.

Question:
{{questionText}}

Maximum Points:
{{points}}

Model Answer:
{{modelAnswer}}

Examinee's Answer:
{{answerText}}

Provide a score and a justification for the score.
The score should be an integer between 0 and the maximum points.
The justification should clearly explain the reasoning behind the assigned score by comparing the examinee's answer to the model answer.`,
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
