'use client';

import type { Child } from '@/lib/types';
import { getCycleStatus, getCyclePrediction } from '@/lib/utils';
import UterusIcon from './UterusIcon';

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

    let mainText = 'Not Enough Data';
    let subText = 'Log more cycles';

    if (isOnPeriod) {
        mainText = `Day ${currentDay}`;
        subText = 'Currently on period';
    } else if (daysUntilNextCycle !== null) {
        if (daysUntilNextCycle > 1) {
            mainText = `In ${daysUntilNextCycle} days`;
        } else if (daysUntilNextCycle === 1) {
            mainText = 'Tomorrow';
        } else {
             mainText = 'Expected';
        }
        subText = 'Next predicted period';
    }
    
    return (
        <div className="relative flex flex-col items-center justify-center gap-4 my-8">
            <div className="relative h-64 w-64">
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
                        stroke="hsl(var(--primary))"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <UterusIcon className="w-16 h-16 text-primary/80 mb-2" />
                    <p className="font-semibold text-muted-foreground">{subText}</p>
                    <p className="text-4xl font-bold font-body">{mainText}</p>
                </div>
            </div>
        </div>
    );
}
