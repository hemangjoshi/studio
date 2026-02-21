
'use server';
/**
 * @fileOverview AI Flow for explaining code snippets.
 *
 * - explainSnippet - Analyzes code and provides a concise explanation.
 * - ExplainSnippetInput - Input containing code and language.
 * - ExplainSnippetOutput - Output containing the explanation string.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainSnippetInputSchema = z.object({
  code: z.string().describe('The source code to be explained.'),
  language: z.string().optional().describe('The programming language of the code.'),
});
export type ExplainSnippetInput = z.infer<typeof ExplainSnippetInputSchema>;

const ExplainSnippetOutputSchema = z.object({
  explanation: z.string().describe('A concise, developer-friendly explanation of the code.'),
});
export type ExplainSnippetOutput = z.infer<typeof ExplainSnippetOutputSchema>;

const prompt = ai.definePrompt({
  name: 'explainSnippetPrompt',
  input: { schema: ExplainSnippetInputSchema },
  output: { schema: ExplainSnippetOutputSchema },
  prompt: `You are an expert software engineer. Explain the following code snippet briefly and clearly for other developers. 
  Focus on the 'what' and 'why'. Keep the explanation under 150 words.
  
  Language: {{{language}}}
  Code:
  \n\n
  {{{code}}}`,
});

export async function explainSnippet(input: ExplainSnippetInput): Promise<ExplainSnippetOutput> {
  const explainFlow = ai.defineFlow(
    {
      name: 'explainSnippetFlow',
      inputSchema: ExplainSnippetInputSchema,
      outputSchema: ExplainSnippetOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      if (!output) throw new Error('AI failed to generate an explanation.');
      return output;
    }
  );

  return explainFlow(input);
}
