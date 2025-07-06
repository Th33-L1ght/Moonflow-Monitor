
'use client';

import type { Child } from '@/lib/types';
import { getCycleStatus, getCyclePrediction } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CycleStatusWheelProps {
    child: Child;
}

export function CycleStatusWheel({ child }: CycleStatusWheelProps) {
    const { isOnPeriod, currentDay } = getCycleStatus(child);
    const { daysUntilNextCycle } = getCyclePrediction(child);

    // This is a simplified progress calculation for visual effect.
    const averageCycleLength = getCyclePrediction(child).predictedStartDate ? 30 : 28; // default to 28 if no data
    const periodDuration = 7; // assume 7 days
    const progress = isOnPeriod
        ? (currentDay / periodDuration) * 100
        : daysUntilNextCycle !== null
            ? ((averageCycleLength - (daysUntilNextCycle > 0 ? daysUntilNextCycle : 0)) / averageCycleLength) * 100
            : 0;

    const circumference = 2 * Math.PI * 52; // 2 * pi * r (radius is 52)
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const progressColor = isOnPeriod ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';


    let mainText = 'Not Enough Data';
    let subText = 'Log more cycles';
    let isDefaultState = true;

    if (isOnPeriod) {
        mainText = `Day ${currentDay}`;
        subText = 'Currently on period';
        isDefaultState = false;
    } else if (daysUntilNextCycle !== null) {
        if (daysUntilNextCycle > 1) {
            mainText = `In ${daysUntilNextCycle} days`;
        } else if (daysUntilNextCycle === 1) {
            mainText = 'Tomorrow';
        } else {
             mainText = 'Expected';
        }
        subText = 'Next predicted period';
        isDefaultState = false;
    }
    
    return (
        <div className="relative flex flex-col items-center justify-center gap-4 my-2">
            <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                <svg className="absolute inset-0" viewBox="0 0 120 120">
                    {/* Background Circle */}
                    <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="12"
                    />
                     {/* Progress Arc */}
                     <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={progressColor}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <Avatar className="h-20 w-20 border-2 mb-2">
                      <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="font-body text-2xl font-bold truncate w-full">{child.name}</h1>
                    <p className="text-sm font-semibold text-muted-foreground">{subText}</p>
                    <p className={cn(
                        "font-bold w-full truncate",
                        isDefaultState ? "text-base" : "text-lg"
                    )}>
                        {mainText}
                    </p>
                </div>
            </div>
        </div>
    );
}
