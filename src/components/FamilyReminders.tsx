
'use client';

import type { Child } from "@/lib/types";
import { getCyclePrediction } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PadsButterflyIcon } from "@/components/PadsButterflyIcon";
import { useRouter } from 'next/navigation';

interface FamilyRemindersProps {
    profiles: Child[];
}

export default function FamilyReminders({ profiles }: FamilyRemindersProps) {
  const router = useRouter();

  const reminders = profiles
    .map(child => {
      // Reminders are only for child profiles
      if (child.isParentProfile) {
          return null;
      }
      const { daysUntilNextCycle } = getCyclePrediction(child);
      if (daysUntilNextCycle !== null && daysUntilNextCycle >= 1 && daysUntilNextCycle <= 7) {
        return {
          childId: child.id,
          childName: child.name,
          days: daysUntilNextCycle
        };
      }
      return null;
    })
    .filter((r): r is { childId: string; childName: string; days: number; } => r !== null)
    .sort((a, b) => a.days - b.days);

  if (reminders.length === 0) {
    return null;
  }

  return (
    <Card className="bg-accent/20 border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent-foreground">
            <PadsButterflyIcon className="h-5 w-5" />
            Upcoming Period Reminders
        </CardTitle>
        <CardDescription className="text-foreground/80">
            Time to stock up on supplies for the upcoming week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
            {reminders.map(reminder => (
                <li key={reminder.childId} className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{reminder.childName}</p>
                    <button 
                        onClick={() => router.push(`/child/${reminder.childId}`)}
                        className="text-sm text-right text-foreground/90 cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                    >
                        {reminder.days === 1 ? 'Starts tomorrow' : `In ${reminder.days} days`}
                    </button>
                </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
