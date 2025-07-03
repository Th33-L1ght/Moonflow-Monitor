
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Child, Mood } from '@/lib/types';
import { differenceInDays, startOfDay } from 'date-fns';
import { toDate } from '@/lib/utils';
import { useMemo } from 'react';

interface MoodChartProps {
    child: Child;
}

const moodColors: Record<Mood, string> = {
    Happy: 'hsl(var(--chart-2))',
    Fine: 'hsl(var(--chart-1))',
    Sad: 'hsl(var(--chart-4))',
    Moody: 'hsl(var(--chart-5))',
};

const chartConfig = {
    Happy: { label: 'Happy', color: moodColors.Happy },
    Fine: { label: 'Fine', color: moodColors.Fine },
    Sad: { label: 'Sad', color: moodColors.Sad },
    Moody: { label: 'Moody', color: moodColors.Moody },
} satisfies ChartConfig;

export default function MoodChart({ child }: MoodChartProps) {
    const chartData = useMemo(() => {
        const moodDataByDay: { [key: number]: { [key in Mood]?: number } & { name: string } } = {};

        if (!child || !child.cycles) {
            return [];
        }

        child.cycles.forEach(cycle => {
            cycle.symptoms.forEach(symptom => {
                const dayOfPeriod = differenceInDays(startOfDay(toDate(symptom.date)), startOfDay(toDate(cycle.startDate))) + 1;
                if (dayOfPeriod > 0 && dayOfPeriod < 15) { // Only track first 15 days
                    if (!moodDataByDay[dayOfPeriod]) {
                        moodDataByDay[dayOfPeriod] = { name: `Day ${dayOfPeriod}` };
                    }
                    if (!moodDataByDay[dayOfPeriod][symptom.mood]) {
                        moodDataByDay[dayOfPeriod][symptom.mood] = 0;
                    }
                    moodDataByDay[dayOfPeriod][symptom.mood]!++;
                }
            });
        });

        return Object.values(moodDataByDay).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
    }, [child]);
    
    const hasData = chartData.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mood Patterns</CardTitle>
                <CardDescription>This chart shows mood occurrences on each day of the period, aggregated across all cycles.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Legend />
                            {(Object.keys(moodColors) as Mood[]).map((mood) => (
                                <Bar key={mood} dataKey={mood} fill={`var(--color-${mood})`} radius={[4, 4, 0, 0]} barSize={15} />
                            ))}
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[200px]">
                        <p className="font-semibold">No mood data logged yet.</p>
                        <p className="text-sm">Log some symptoms to see mood patterns here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
