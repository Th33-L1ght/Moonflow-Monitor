
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCycleStatus, getCyclePrediction } from '@/lib/utils';
import type { Child } from '@/lib/types';
import { Calendar, Droplets, Zap } from 'lucide-react';

interface CycleOverviewProps {
    child: Child;
}

export function CycleOverview({ child }: CycleOverviewProps) {
    const { isOnPeriod, currentDay } = getCycleStatus(child);
    const { predictedStartDate, daysUntilNextCycle } = getCyclePrediction(child);

    const sortedCycles = [...child.cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const averageLength = sortedCycles.length > 1 
        ? getCyclePrediction(child).predictedStartDate ? '28-32 days' : 'Not enough data' // Simplified for now
        : 'Not enough data';


    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Current Status</CardTitle>
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {isOnPeriod ? `Period, Day ${currentDay}` : 'Between Cycles'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isOnPeriod ? 'Currently on her period' : 'In the follicular phase'}
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Next Predicted Period</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-3xl font-bold">
                        {daysUntilNextCycle !== null ? `In ${daysUntilNextCycle} days` : 'Not enough data'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {predictedStartDate ? predictedStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'Waiting for more cycle data'}
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Average Cycle Length</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-3xl font-bold">
                        {averageLength}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Based on the last {sortedCycles.length} cycle(s) logged
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
