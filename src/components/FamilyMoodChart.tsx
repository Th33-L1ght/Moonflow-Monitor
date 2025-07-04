
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import type { Child, Mood } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { toDate } from '@/lib/utils';
import { subDays, isAfter } from 'date-fns';

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

interface FamilyMoodChartProps {
    children: Child[];
}

export function FamilyMoodChart({ children }: FamilyMoodChartProps) {
    const chartData = useMemo(() => {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const data = children.map(child => {
            const moodCounts: { [key in Mood]: number } = {
                Happy: 0,
                Fine: 0,
                Sad: 0,
                Moody: 0,
            };

            child.cycles.forEach(cycle => {
                cycle.symptoms.forEach(symptom => {
                    if (isAfter(toDate(symptom.date), thirtyDaysAgo)) {
                        moodCounts[symptom.mood]++;
                    }
                });
            });

            return {
                name: child.name,
                ...moodCounts,
            };
        });

        return data;
    }, [children]);

    const hasData = chartData.some(childData => 
        childData.Happy > 0 || childData.Fine > 0 || childData.Sad > 0 || childData.Moody > 0
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Family Mood Overview</CardTitle>
                <CardDescription>A summary of moods logged across all profiles in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <BarChart data={chartData} layout="vertical" margin={{ right: 20 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                width={80}
                            />
                            <XAxis dataKey="value" type="number" hide />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Legend />
                            {(Object.keys(moodColors) as Mood[]).map((mood) => (
                                <Bar key={mood} dataKey={mood} stackId="a" fill={`var(--color-${mood})`} radius={[0, 4, 4, 0]} barSize={30} />
                            ))}
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[250px]">
                        <p className="font-semibold">No mood data logged recently.</p>
                        <p className="text-sm">Log some symptoms to see the mood overview here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
