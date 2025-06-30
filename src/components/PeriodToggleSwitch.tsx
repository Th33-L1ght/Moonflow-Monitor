'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Child, Cycle } from '@/lib/types';
import { getCycleStatus, toDate } from '@/lib/utils';
import { addDays, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PeriodToggleSwitchProps {
  child: Child;
  onUpdate: (updatedData: Partial<Omit<Child, 'id'>>) => void;
}

export function PeriodToggleSwitch({ child, onUpdate }: PeriodToggleSwitchProps) {
  const { toast } = useToast();
  const { isOnPeriod, activeCycleId } = getCycleStatus(child);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (isToggledOn: boolean) => {
    if (isLoading) return;
    setIsLoading(true);

    let updatedCycles = JSON.parse(JSON.stringify(child.cycles));

    if (isToggledOn) {
      // Logic to start a period
      if (isOnPeriod) {
        setIsLoading(false);
        return; // Already on period, do nothing
      }
      const newCycle: Cycle = {
        id: `cycle_${Date.now()}`,
        startDate: new Date(),
        endDate: addDays(new Date(), 4), // Default 5 day period
        symptoms: [],
      };
      updatedCycles.push(newCycle);
      toast({ title: "Period Started", description: `A new cycle has been logged for ${child.name}.` });
    } else {
      // Logic to end a period
      if (!isOnPeriod || !activeCycleId) {
        setIsLoading(false);
        return; // Not on period, do nothing
      }
      const activeCycleIndex = updatedCycles.findIndex((c: Cycle) => c.id === activeCycleId);
      if (activeCycleIndex > -1) {
        const cycleToUpdate = updatedCycles[activeCycleIndex];
        // If start date is today, just remove the cycle
        if (isSameDay(toDate(cycleToUpdate.startDate), new Date())) {
             updatedCycles.splice(activeCycleIndex, 1);
             toast({ title: "Cycle Removed", description: `The cycle for ${child.name} starting today has been removed.` });
        } else {
            // Otherwise, set the end date to today
             cycleToUpdate.endDate = new Date();
             toast({ title: "Period Ended", description: `The current cycle for ${child.name} has been marked as ended.` });
        }
      }
    }

    try {
      // Optimistically update parent state and persist changes
      onUpdate({ cycles: updatedCycles });
    } catch (error) {
      console.error("Failed to update period status:", error);
      toast({ title: "Error", description: "Could not update the period status.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`period-toggle-${child.id}`}
        checked={isOnPeriod}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label={`Toggle period status for ${child.name}`}
      />
      <Label htmlFor={`period-toggle-${child.id}`} className={cn("text-sm transition-colors", isOnPeriod ? 'text-destructive font-medium' : 'text-muted-foreground')}>
        {isLoading ? "Updating..." : (isOnPeriod ? 'On Period' : 'Not on Period')}
      </Label>
    </div>
  );
}
