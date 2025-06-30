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
import { cn } from '@/lib/utils';

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

export function SymptomTracker() {
  const [cramp, setCramp] = React.useState<string>('1');
  const [mood, setMood] = React.useState<string>('Happy');

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Symptom Log</CardTitle>
        <CardDescription>
          How are you feeling today? Tap to select.
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
        <Button className="w-full">Save Today's Log</Button>
      </CardContent>
    </Card>
  );
}
