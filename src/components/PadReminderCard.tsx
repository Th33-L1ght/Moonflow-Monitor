'use client';

import { ShoppingBag } from 'lucide-react';
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
        <Card className="bg-teal-500/10 border-teal-500/20">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <ShoppingBag className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-md font-semibold text-teal-700">Heads Up!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground/80">
                    {message}
                </p>
            </CardContent>
        </Card>
    );
}
