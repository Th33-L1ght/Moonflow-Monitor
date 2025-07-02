
'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn, toDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Child, Cycle, Mood } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface PeriodCalendarProps {
  child: Child;
  onUpdate: (data: Partial<Omit<Child, 'id'>>) => void;
  canEdit: boolean;
}

const moodEmojis: Record<Mood, string> = {
  Happy: '😊',
  Moody: '😠',
  Fine: '🙂',
  Sad: '😢',
};


export function PeriodCalendar({ child, onUpdate, canEdit }: PeriodCalendarProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSaveCycle = async () => {
    if (!date?.from || !date?.to) {
      toast({
        title: 'Invalid Date Range',
        description: 'Please select both a start and end date.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const newCycle: Omit<Cycle, 'id'> = {
      startDate: date.from,
      endDate: date.to,
      symptoms: [],
    };

    const newCycleWithId: Cycle = {
      ...newCycle,
      id: crypto.randomUUID(),
    }

    try {
      const updatedCycles = [...child.cycles, newCycleWithId];
      onUpdate({ cycles: updatedCycles });
      toast({
        title: 'Success!',
        description: 'New cycle has been logged.',
      });
      setDate(undefined);
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to log new cycle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const periodDays: Date[] = [];
  const moodDays: { date: Date, mood: Mood }[] = [];

  child.cycles.forEach((cycle) => {
    let day = toDate(cycle.startDate);
    const endDate = toDate(cycle.endDate);
    
    while (day <= endDate) {
      periodDays.push(new Date(day));
      day = addDays(day, 1);
    }

    cycle.symptoms.forEach(symptom => {
        moodDays.push({ date: toDate(symptom.date), mood: symptom.mood });
    });
  });

  const modifiers = {
    period: periodDays,
    ...Object.fromEntries(
        Object.keys(moodEmojis).map(mood => [
            mood.toLowerCase(),
            moodDays.filter(md => md.mood === mood).map(md => md.date)
        ])
    )
  };

  const modifiersStyles = {
    period: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
    },
    today: {
      borderColor: 'hsl(var(--primary))'
    },
    ...Object.fromEntries(
        Object.keys(moodEmojis).map(mood => [
            mood.toLowerCase(),
            {
            }
        ])
    )
  };

  const DayContent = (props: { date: Date; displayMonth: Date }) => {
    const moodEntry = moodDays.find(md => isSameDay(md.date, props.date));
    if (moodEntry) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {format(props.date, 'd')}
          <span className="absolute bottom-0 text-xs">{moodEmojis[moodEntry.mood]}</span>
        </div>
      );
    }
    return format(props.date, 'd');
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Log Period
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Log New Period</DialogTitle>
                <DialogDescription>
                    Select the start and end date of the period.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal bg-background',
                            !date && 'text-muted-foreground'
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                            <>
                                {format(date.from, 'LLL dd, y')} -{' '}
                                {format(date.to, 'LLL dd, y')}
                            </>
                            ) : (
                            format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        />
                    </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter>
                <Button onClick={handleSaveCycle} disabled={isLoading || !date?.from || !date?.to}>
                    {isLoading ? 'Saving...' : 'Save Cycle'}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        )}
      </div>
      <div className="flex justify-center p-4 border rounded-lg bg-background">
        <style>{`
            .rdp-day { border-radius: 9999px; }
            .rdp-day_selected { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
            .rdp-head_cell { text-transform: uppercase; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
        `}</style>
        <Calendar
          mode="single"
          selected={new Date()}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          showOutsideDays
          components={{ DayContent }}
          classNames={{
            day: "h-10 w-10",
            head_cell: "w-10"
          }}
        />
      </div>
      </>
  );
}
