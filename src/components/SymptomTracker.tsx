
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from './ui/button';
import { getCycleStatus, toDate } from '@/lib/utils';
import type { Child, CrampLevel, Mood, SymptomLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { isSameDay } from 'date-fns';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

const crampLevels = [
  { level: 1, emoji: '😌', label: 'None' },
  { level: 2, emoji: '😕', label: 'Mild' },
  { level: 3, emoji: '😣', label: 'Moderate' },
  { level: 4, emoji: '😫', label: 'Severe' },
];

const moods: { mood: Mood, emoji: string }[] = [
  { mood: 'Happy', emoji: '😊' },
  { mood: 'Moody', emoji: '😠' },
  { mood: 'Fine', emoji: '🙂' },
  { mood: 'Sad', emoji: '😢' },
];

interface SymptomTrackerProps {
    child: Child;
    onUpdate: (data: Partial<Omit<Child, 'id'>>) => void;
    canEdit: boolean;
}

export default function SymptomTracker({ child, onUpdate, canEdit }: SymptomTrackerProps) {
  const [cramp, setCramp] = React.useState<string>('1');
  const [mood, setMood] = React.useState<string>('Happy');
  const [note, setNote] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const { isOnPeriod, activeCycleId } = getCycleStatus(child);
  const isButtonDisabled = !isOnPeriod || isLoading || !canEdit;

  // Set initial state based on today's log if it exists
  React.useEffect(() => {
    if (activeCycleId) {
        const activeCycle = child.cycles.find(c => c.id === activeCycleId);
        const todayLog = activeCycle?.symptoms.find(s => isSameDay(toDate(s.date), new Date()));
        if (todayLog) {
            setCramp(String(todayLog.crampLevel));
            setMood(todayLog.mood);
            setNote(todayLog.note || '');
        } else {
            setCramp('1');
            setMood('Happy');
            setNote('');
        }
    }
  }, [child, activeCycleId]);


  const handleSaveLog = async () => {
    if (!isOnPeriod || !activeCycleId) {
        toast({
            title: 'Not on period',
            description: "Symptoms can only be logged during a period.",
            variant: 'destructive'
        });
        return;
    }
    
    setIsLoading(true);

    const newSymptomLog: SymptomLog = {
        date: new Date(),
        crampLevel: parseInt(cramp, 10) as CrampLevel,
        mood: mood as Mood,
        note: note.trim(),
    };

    const updatedCycles = child.cycles.map(cycle => {
        if (cycle.id === activeCycleId) {
            const existingLogIndex = cycle.symptoms.findIndex(symptom => 
                isSameDay(toDate(symptom.date), toDate(newSymptomLog.date))
            );
            
            let updatedSymptoms;
            if (existingLogIndex > -1) {
                updatedSymptoms = [...cycle.symptoms];
                updatedSymptoms[existingLogIndex] = newSymptomLog;
            } else {
                updatedSymptoms = [...cycle.symptoms, newSymptomLog];
            }
            
            return { ...cycle, symptoms: updatedSymptoms };
        }
        return cycle;
    });

    try {
        onUpdate({ cycles: updatedCycles });
        toast({
            title: "Log Saved",
            description: "Today's symptoms have been saved successfully."
        });
    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Failed to save symptoms. Please try again.",
            variant: 'destructive'
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Symptoms</CardTitle>
        <CardDescription>
          {isOnPeriod ? (canEdit ? "How are you feeling today?" : "Viewing symptoms logged.") : "Tracking is available during a period."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Cramp Level</h3>
          <ToggleGroup
            type="single"
            value={cramp}
            onValueChange={(value) => {
              if (value) setCramp(value);
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            disabled={!canEdit || !isOnPeriod}
          >
            {crampLevels.map(({ level, emoji, label }) => (
              <ToggleGroupItem
                key={level}
                value={String(level)}
                aria-label={label}
                className="flex flex-col h-20 w-full rounded-lg gap-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary border"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs">{label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Mood</h3>
          <ToggleGroup
            type="single"
            value={mood}
            onValueChange={(value) => {
              if (value) setMood(value);
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            disabled={!canEdit || !isOnPeriod}
          >
            {moods.map(({ mood, emoji }) => (
              <ToggleGroupItem
                key={mood}
                value={mood}
                aria-label={mood}
                className="flex flex-col h-20 w-full rounded-lg gap-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary border"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs">{mood}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <Label htmlFor="note" className="text-lg font-medium mb-3 block">
            Add a Note
          </Label>
          <Textarea
            id="note"
            placeholder="Any additional thoughts or symptoms... (e.g., cravings, headaches)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!canEdit || !isOnPeriod}
            maxLength={500}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {note.length} / 500
          </p>
        </div>
        {canEdit && (
          <Button size="lg" className="w-full h-12 text-lg font-bold" onClick={handleSaveLog} disabled={isButtonDisabled}>
              {isLoading ? 'Saving...' : "Save Today's Log"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
