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

// We need a specific Zod schema for the AI flow that matches the data structure.
// Dates will be simplified to strings for the prompt.
const SymptomLogSchema = z.object({
    date: z.string().describe("The date of the symptom log, in YYYY-MM-DD format."),
    crampLevel: z.number().describe("A number from 1 (none) to 4 (severe)."),
    mood: z.string().describe("The logged mood, e.g., 'Happy', 'Sad', 'Irritable'.")
});

const CycleSchema = z.object({
    startDate: z.string().describe("The start date of the cycle, in YYYY-MM-DD format."),
    endDate: z.string().describe("The end date of the cycle, in YYYY-MM-DD format."),
    symptoms: z.array(SymptomLogSchema)
});

const CycleInsightInputSchema = z.object({
  cycles: z.array(CycleSchema).describe("An array of cycle data.")
});
export type CycleInsightInput = z.infer<typeof CycleInsightInputSchema>;

const CycleInsightOutputSchema = z.object({
  insight: z.string().describe('A concise (2-3 sentences), helpful, and easy-to-understand insight based on the cycle data. Should be encouraging and supportive.')
});
export type CycleInsightOutput = z.infer<typeof CycleInsightOutputSchema>;

// Helper to convert full Child object to the simplified input for the AI
const formatCyclesForAI = (cycles: Cycle[]): CycleInsightInput => {
    return {
        cycles: cycles.map(cycle => ({
            startDate: cycle.startDate.toISOString().split('T')[0],
            endDate: cycle.endDate.toISOString().split('T')[0],
            symptoms: cycle.symptoms.map(symptom => ({
                date: symptom.date.toISOString().split('T')[0],
                crampLevel: symptom.crampLevel,
                mood: symptom.mood
            }))
        }))
    };
}

export async function generateCycleInsight(cycles: Cycle[]): Promise<CycleInsightOutput> {
    const formattedInput = formatCyclesForAI(cycles);
    return cycleInsightFlow(formattedInput);
}

const prompt = ai.definePrompt({
    name: 'cycleInsightPrompt',
    input: { schema: CycleInsightInputSchema },
    output: { schema: CycleInsightOutputSchema },
    prompt: `You are a friendly and empathetic health assistant specializing in adolescent health. Analyze the following menstrual cycle data.
Data:
{{#each cycles}}
- Cycle from {{startDate}} to {{endDate}}.
  {{#if symptoms.length}}
    Symptoms logged:
    {{#each symptoms}}
    - On {{date}}: Cramps level {{crampLevel}} (1=none, 4=severe), Mood: {{mood}}.
    {{/each}}
  {{else}}
    (No symptoms logged for this cycle)
  {{/if}}
{{/each}}

Based on this data, provide one concise (2-3 sentences), helpful, and easy-to-understand insight. Frame the insight in a positive and supportive tone. Focus on patterns in symptoms, mood, or cycle length.

If there isn't enough data (e.g., less than 2 cycles or no symptoms logged), provide a general supportive message encouraging continued tracking, like "Keep up the great work logging symptoms! The more data we have, the better insights we can find together."
Do not invent data or make medical diagnoses.
`,
});

const cycleInsightFlow = ai.defineFlow(
    {
        name: 'cycleInsightFlow',
        inputSchema: CycleInsightInputSchema,
        outputSchema: CycleInsightOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
