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
  answerText: z.string().describe('The text of the examinee answer.'),
  scoringRubric: z.string().describe('The scoring rubric to use for grading the answer.'),
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
  prompt: `You are an AI grading assistant. Please grade the following answer based on the provided scoring rubric.

Answer:
{{answerText}}

Scoring Rubric:
{{scoringRubric}}

Provide a score and a justification for the score.

Ensure that the score aligns with the rubric and the justification clearly explains the reasoning behind the assigned score.`,
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
