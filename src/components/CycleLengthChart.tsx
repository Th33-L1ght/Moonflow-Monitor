'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Child } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { toDate } from '@/lib/utils';
import { useMemo } from 'react';
import { format } from 'date-fns';

interface CycleLengthChartProps {
    child: Child;
}

const chartConfig = {
    length: {
        label: "Cycle Length (days)",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;


export default function CycleLengthChart({ child }: CycleLengthChartProps) {
     const chartData = useMemo(() => {
        if (!child || child.cycles.length < 2) {
            return [];
        }

        const sortedCycles = [...child.cycles].sort((a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime());
        
        const data = [];
        for (let i = 1; i < sortedCycles.length; i++) {
            const startDate1 = toDate(sortedCycles[i-1].startDate);
            const startDate2 = toDate(sortedCycles[i].startDate);
            const cycleLength = differenceInDays(startDate2, startDate1);

            if (cycleLength > 15 && cycleLength < 60) {
                 data.push({
                    name: format(startDate1, 'MMM yyyy'),
                    length: cycleLength,
                });
            }
        }
        return data.slice(-6); // show last 6 cycles max
    }, [child]);

    const hasData = chartData.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cycle Length History</CardTitle>
                <CardDescription>This chart shows the length in days of previous cycles.</CardDescription>
            </CardHeader>
            <CardContent>
                 {hasData ? (
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                dataKey="length"
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin - 5', 'dataMax + 5']}
                                tickFormatter={(value) => `${value}d`}
                           />
                            <ChartTooltipContent />
                            <Bar dataKey="length" fill="var(--color-length)" radius={4} barSize={30} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[200px]">
                        <p className="font-semibold">Not enough cycle data.</p>
                        <p className="text-sm">Log at least two full cycles to see history here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
