// Summarizes the AI's grading reasoning for admin review, enhancing review efficiency.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnswerFeedbackInputSchema = z.object({
  answerText: z.string().describe('The examinee answer text to be graded.'),
  aiFeedback: z.string().describe('The AI grading feedback for the answer.'),
  questionText: z.string().describe('The question that was asked.'),
});
export type SummarizeAnswerFeedbackInput = z.infer<typeof SummarizeAnswerFeedbackInputSchema>;

const SummarizeAnswerFeedbackOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the AI grading feedback.'),
});
export type SummarizeAnswerFeedbackOutput = z.infer<typeof SummarizeAnswerFeedbackOutputSchema>;

export async function summarizeAnswerFeedback(
  input: SummarizeAnswerFeedbackInput
): Promise<SummarizeAnswerFeedbackOutput> {
  return summarizeAnswerFeedbackFlow(input);
}

const summarizeAnswerFeedbackPrompt = ai.definePrompt({
  name: 'summarizeAnswerFeedbackPrompt',
  input: {schema: SummarizeAnswerFeedbackInputSchema},
  output: {schema: SummarizeAnswerFeedbackOutputSchema},
  prompt: `Summarize the following AI feedback for an exam answer. Provide a concise summary of the AI's reasoning for the given score. The question asked was: {{{questionText}}}. The student answered with: {{{answerText}}}. The AI feedback was: {{{aiFeedback}}}.`,
});

const summarizeAnswerFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeAnswerFeedbackFlow',
    inputSchema: SummarizeAnswerFeedbackInputSchema,
    outputSchema: SummarizeAnswerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await summarizeAnswerFeedbackPrompt(input);
    return output!;
  }
);
