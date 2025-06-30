'use client';

import type { Child } from '@/lib/types';
import { getCycleStatus } from '@/lib/utils';
import UterusIcon from './UterusIcon';

interface CycleStatusWheelProps {
    child: Child;
}

export function CycleStatusWheel({ child }: CycleStatusWheelProps) {
    const { isOnPeriod, currentDay } = getCycleStatus(child);

    const progress = isOnPeriod ? (currentDay / 7) * 100 : 0; // Assuming a 7 day period for visual
    const circumference = 2 * Math.PI * 52; // 2 * pi * r (radius is 52)
    const strokeDashoffset = circumference - (progress / 100) * circumference;

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
                        stroke="hsl(var(--card))"
                        strokeWidth="12"
                    />
                    {/* Background Circle for progress */}
                     <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="hsl(120 40% 50% / 0.1)" /* Faded green */
                        strokeWidth="12"
                    />
                     {/* Progress Arc */}
                    {isOnPeriod && (
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
                    )}
                   
                    {/* Fertile Window Arc (Green) */}
                    <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="hsl(120 40% 50%)" /* Green */
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (100 / 28 * 6)} // Example: 6 day fertile window in a 28 day cycle
                        strokeLinecap="round"
                        transform="rotate(65 60 60)" // Position it in the cycle
                    />

                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <UterusIcon className="w-16 h-16 text-white/80" />
                    <p className="mt-2 font-semibold text-lg">{isOnPeriod ? 'Period' : 'Follicular'}</p>
                    <p className="text-4xl font-bold font-body">{isOnPeriod ? `Day ${currentDay}` : 'Day 10'}</p>
                </div>
            </div>
        </div>
    );
}
