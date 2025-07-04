'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Child, Mood } from '@/lib/types';
import { subDays, startOfDay, isWithinInterval } from 'date-fns';
import { toDate } from '@/lib/utils';
import { useMemo } from 'react';

const moodColors: Record<Mood, string> = {
    Happy: 'hsl(var(--chart-2))',
    Fine: 'hsl(var(--chart-1))',
    Sad: 'hsl(var(--chart-4))',
    Moody: 'hsl(var(--chart-5))',
};

const chartConfig = {
    ...Object.fromEntries(
        (Object.keys(moodColors) as Mood[]).map(mood => [
            mood, { label: mood, color: moodColors[mood] }
        ])
    )
} satisfies ChartConfig;

export default function FamilyMoodChart({ children }: { children: Child[] }) {
    const chartData = useMemo(() => {
        const childProfiles = children.filter(p => !p.isParentProfile);
        const moodCounts: { [key in Mood]?: number } = {};
        const thirtyDaysAgo = subDays(new Date(), 30);
        
        childProfiles.forEach(child => {
            child.cycles.forEach(cycle => {
                cycle.symptoms.forEach(symptom => {
                    const symptomDate = toDate(symptom.date);
                    if (symptomDate >= thirtyDaysAgo) {
                         if (!moodCounts[symptom.mood]) {
                            moodCounts[symptom.mood] = 0;
                        }
                        moodCounts[symptom.mood]!++;
                    }
                });
            });
        });

        return (Object.keys(chartConfig) as Mood[]).map(mood => ({
            mood: mood,
            count: moodCounts[mood] || 0,
            fill: `var(--color-${mood})`,
        }));
    }, [children]);

    const hasData = chartData.some(d => d.count > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Children's Mood Overview</CardTitle>
                <CardDescription>Moods logged by children in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                 {hasData ? (
                     <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                            <YAxis
                                dataKey="mood"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <XAxis dataKey="count" type="number" hide />
                            <ChartTooltipContent />
                            <Bar dataKey="count" radius={5} barSize={20} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[150px]">
                        <p className="font-semibold">No mood data.</p>
                        <p className="text-sm">Log moods on child profiles to see an overview here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
