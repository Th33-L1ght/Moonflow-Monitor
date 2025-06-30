'use client';

import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PadReminderCardProps {
    daysUntilNextCycle: number | null;
}

export function PadReminderCard({ daysUntilNextCycle }: PadReminderCardProps) {
    // Show reminder if the next period is within 7 days.
    // Don't show if it's today or in the past.
    if (daysUntilNextCycle === null || daysUntilNextCycle > 7 || daysUntilNextCycle < 1) {
        return null;
    }
    
    const message = daysUntilNextCycle === 1 
        ? "Her next period may start tomorrow. Time to stock up on supplies!"
        : `Her next period starts in about ${daysUntilNextCycle} days. Time to stock up on supplies!`;

    return (
        <Card className="bg-green-500/10 border-green-500/20 dark:bg-green-500/20">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                <ShoppingBag className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg font-headline text-green-500/90">Reminder</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-primary-foreground/80">
                    {message}
                </p>
            </CardContent>
        </Card>
    );
}
