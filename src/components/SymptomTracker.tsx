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
import { getCycleStatus } from '@/lib/utils';
import type { Child, CrampLevel, Mood, SymptomLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateChild } from '@/lib/firebase/firestore';
import { isSameDay, startOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


const crampLevels = [
  { level: 1, emoji: '😌', label: 'None' },
  { level: 2, emoji: '😕', label: 'Mild' },
  { level: 3, emoji: '😣', label: 'Moderate' },
  { level: 4, emoji: '😫', label: 'Severe' },
];

const moods = [
  { mood: 'Happy', emoji: '😊' },
  { mood: 'Sad', emoji: '😢' },
  { mood: 'Irritable', emoji: '😠' },
  { mood: 'Calm', emoji: '🧘‍♀️' },
  { mood: 'Anxious', emoji: '😟' },
];

interface SymptomTrackerProps {
    child: Child;
    userId: string;
    onUpdate: () => void;
}

const toDate = (date: Date | Timestamp): Date => {
    return date instanceof Timestamp ? date.toDate() : date;
}

export function SymptomTracker({ child, userId, onUpdate }: SymptomTrackerProps) {
  const [cramp, setCramp] = React.useState<string>('1');
  const [mood, setMood] = React.useState<string>('Happy');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const { isOnPeriod, activeCycleId } = getCycleStatus(child);

  // Set initial state based on today's log if it exists
  React.useEffect(() => {
    if (activeCycleId) {
        const activeCycle = child.cycles.find(c => c.id === activeCycleId);
        const todayLog = activeCycle?.symptoms.find(s => isSameDay(toDate(s.date), new Date()));
        if (todayLog) {
            setCramp(String(todayLog.crampLevel));
            setMood(todayLog.mood);
        } else {
            setCramp('1');
            setMood('Happy');
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
        await updateChild(userId, child.id, { cycles: updatedCycles });
        toast({
            title: "Log Saved",
            description: "Today's symptoms have been saved successfully."
        });
        onUpdate();
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
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Symptom Log</CardTitle>
        <CardDescription>
          {isOnPeriod ? "How are you feeling today? Tap to select." : "Tracking is available during a period."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Cramps</h3>
          <ToggleGroup
            type="single"
            value={cramp}
            onValueChange={(value) => {
              if (value) setCramp(value);
            }}
            className="grid grid-cols-4 gap-2"
            disabled={!isOnPeriod || isLoading}
          >
            {crampLevels.map(({ level, emoji, label }) => (
              <ToggleGroupItem
                key={level}
                value={String(level)}
                aria-label={label}
                className="flex flex-col h-auto p-2 gap-1"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs">{label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Mood</h3>
          <ToggleGroup
            type="single"
            value={mood}
            onValueChange={(value) => {
              if (value) setMood(value);
            }}
            className="grid grid-cols-5 gap-2"
            disabled={!isOnPeriod || isLoading}
          >
            {moods.map(({ mood, emoji }) => (
              <ToggleGroupItem
                key={mood}
                value={mood}
                aria-label={mood}
                className="h-14 w-14 text-2xl"
              >
                {emoji}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Button className="w-full" onClick={handleSaveLog} disabled={!isOnPeriod || isLoading}>
            {isLoading ? 'Saving...' : "Save Today's Log"}
        </Button>
      </CardContent>
    </Card>
  );
}
