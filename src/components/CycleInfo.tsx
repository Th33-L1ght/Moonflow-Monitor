'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { type Child } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';

interface CycleInfoProps {
  child: Child;
}

export function CycleInfo({ child }: CycleInfoProps) {
  const cycleData = child.cycles.map((cycle, index) => {
    const cycleLength =
      index > 0
        ? differenceInDays(cycle.startDate, child.cycles[index - 1].startDate)
        : 28; // Estimate for first cycle
    return {
      name: format(cycle.startDate, 'MMM'),
      length: cycleLength,
    };
  }).slice(0, 6).reverse(); // show last 6 months

  const totalCycleLength = cycleData.slice(0, -1).reduce((acc, curr) => acc + curr.length, 0);
  const avgCycleLength = cycleData.length > 1 ? Math.round(totalCycleLength / (cycleData.length-1)) : 28;
  
  const totalPeriodLength = child.cycles.reduce((acc, curr) => {
      return acc + differenceInDays(curr.endDate, curr.startDate) + 1;
  }, 0);
  const avgPeriodLength = child.cycles.length > 0 ? Math.round(totalPeriodLength / child.cycles.length) : 5;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Cycle History</CardTitle>
        <CardDescription>
          A look at cycle patterns and averages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="rounded-lg p-4 bg-muted">
                <p className="text-sm text-muted-foreground">Avg. Cycle Length</p>
                <p className="text-2xl font-bold font-headline">{avgCycleLength} days</p>
            </div>
             <div className="rounded-lg p-4 bg-muted">
                <p className="text-sm text-muted-foreground">Avg. Period Length</p>
                <p className="text-2xl font-bold font-headline">{avgPeriodLength} days</p>
            </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cycleData}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}d`}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
             />
            <Bar dataKey="length" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
