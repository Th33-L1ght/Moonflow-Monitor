'use server';
/**
 * @fileOverview An AI flow to generate insights from cycle data.
 *
 * - generateCycleInsight - A function that analyzes cycle data and returns an insight.
 * - CycleInsightInput - The input type for the generateCycleInsight function.
 * - CycleInsightOutput - The return type for the generateCycleInsight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Cycle } from '@/lib/types';

// Define the Zod schema for the flow's output
const CycleInsightOutputSchema = z.object({
  insight: z.string().describe('A short, helpful, and friendly insight based on the user\'s cycle data. Should be 1-2 sentences.'),
});
export type CycleInsightOutput = z.infer<typeof CycleInsightOutputSchema>;

// Define the Zod schema for the flow's input.
// We'll pass the cycle data as a stringified JSON to keep the prompt simple.
const CycleInsightInputSchema = z.object({
  cycleDataJson: z.string().describe('A JSON string representing an array of the user\'s cycle data.'),
});
export type CycleInsightInput = z.infer<typeof CycleInsightInputSchema>;

// This is the public-facing function that components will call.
// It prepares the data and invokes the Genkit flow.
export async function generateCycleInsight(cycles: Cycle[]): Promise<CycleInsightOutput> {
  const input = {
    cycleDataJson: JSON.stringify(cycles, null, 2),
  };
  return await cycleInsightFlow(input);
}

// Define the Genkit prompt template
const cycleInsightPrompt = ai.definePrompt({
    name: 'cycleInsightPrompt',
    input: { schema: CycleInsightInputSchema },
    output: { schema: CycleInsightOutputSchema },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are a helpful and empathetic assistant for a menstrual cycle tracking app called Light Flow.
Your goal is to provide a single, concise insight based on a user's logged cycle data.

Analyze the following cycle data, which is provided as a JSON string. Look for patterns in cycle length, mood, or reported symptoms (like cramps).

Based on your analysis, generate one short (1-2 sentences), helpful, and friendly insight.

Example Insights:
- "It looks like your last few cycles have been consistently around 28 days. Great job staying regular!"
- "I've noticed that 'Sad' is a common mood logged on the first day of your period. It's okay to feel that way, be extra kind to yourself!"
- "It seems your cramp levels are highest on day 2. Maybe planning a cozy day with a heat pack could help next time."

Here is the user's data:
\`\`\`json
{{{cycleDataJson}}}
\`\`\`
`,
});


// Define the Genkit flow
const cycleInsightFlow = ai.defineFlow(
  {
    name: 'cycleInsightFlow',
    inputSchema: CycleInsightInputSchema,
    outputSchema: CycleInsightOutputSchema,
  },
  async (input) => {
    const { output } = await cycleInsightPrompt(input);
    if (!output) {
        throw new Error("Failed to generate an insight from the model.");
    }
    return output;
  }
);