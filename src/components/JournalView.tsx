'use client';

import type { Child, SymptomLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toDate } from '@/lib/utils';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { PadsButterflyIcon } from './PadsButterflyIcon';

interface JournalViewProps {
    child: Child;
}

export default function JournalView({ child }: JournalViewProps) {
    const journalEntries = useMemo(() => {
        if (!child || !child.cycles) {
            return [];
        }

        const entries: (SymptomLog & { cycleId: string })[] = [];
        child.cycles.forEach(cycle => {
            cycle.symptoms.forEach(symptom => {
                if (symptom.note && symptom.note.trim() !== '') {
                    entries.push({ ...symptom, cycleId: cycle.id });
                }
            });
        });

        return entries.sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime());
    }, [child]);
    
    const hasEntries = journalEntries.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Journal</CardTitle>
                <CardDescription>A collection of all notes logged across cycles.</CardDescription>
            </CardHeader>
            <CardContent>
                 {hasEntries ? (
                     <ScrollArea className="h-96">
                        <div className="space-y-6 pr-6">
                            {journalEntries.map((entry, index) => (
                                <div key={`${entry.cycleId}-${index}`} className="flex flex-col gap-1 border-l-2 border-primary pl-4">
                                    <p className="font-semibold text-primary-foreground">{format(toDate(entry.date), 'MMMM d, yyyy')}</p>
                                    <p className="text-sm text-foreground/90">{entry.note}</p>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        <span>Mood: {entry.mood}</span>
                                        <span className="mx-2">·</span>
                                        <span>Cramps: {entry.crampLevel}/4</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </ScrollArea>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-72">
                        <PadsButterflyIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">No journal entries yet.</p>
                        <p className="text-sm">Add a note in the "Log Symptoms" tab to see it here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
