'use client';

import { ButterflyIcon } from '@/components/ButterflyIcon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PadReminderCardProps {
    daysUntilNextCycle: number | null;
}

export function PadReminderCard({ daysUntilNextCycle }: PadReminderCardProps) {
    if (daysUntilNextCycle === null || daysUntilNextCycle > 7 || daysUntilNextCycle < 1) {
        return null;
    }
    
    const message = daysUntilNextCycle === 1 
        ? "Her next period may start tomorrow. Time to stock up on supplies!"
        : `Her next period starts in about ${daysUntilNextCycle} days. Time to stock up on supplies!`;

    return (
        <Card className="bg-accent/20 border-accent/30">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <ButterflyIcon className="h-5 w-5 text-accent-foreground" />
                <CardTitle className="text-md font-semibold text-accent-foreground">A Little Reminder</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground/80">
                    {message}
                </p>
            </CardContent>
        </Card>
    );
}
