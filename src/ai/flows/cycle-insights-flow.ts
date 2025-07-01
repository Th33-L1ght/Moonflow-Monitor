'use server';
/**
 * @fileOverview An AI flow to generate insights from cycle data.
 *
 * - generateCycleInsight - A function that analyzes cycle data and returns an insight.
 * - CycleInsightInput - The input type for the generateCycleInsight function.
 * - CycleInsightOutput - The return type for the generateCycleInsight function.
 */

import type { Cycle } from '@/lib/types';

// Mocked output type
export type CycleInsightOutput = {
  insight: string;
};

// This is now a mock function as Genkit has been temporarily disabled.
export async function generateCycleInsight(cycles: Cycle[]): Promise<CycleInsightOutput> {
    console.log("AI insight generation is temporarily disabled, returning mock insight.");
    // Fallback to a mock insight.
    return { insight: "Keep up the great work logging symptoms! The more data we have, the better insights we can find together." };
}
