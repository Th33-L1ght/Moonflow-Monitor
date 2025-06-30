import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Child, type Cycle } from "@/lib/types";
import { differenceInDays, isWithinInterval, startOfDay, addDays } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const toDate = (date: Date | Timestamp): Date => {
  return date instanceof Timestamp ? date.toDate() : date;
}

export function getCycleStatus(child: Child | null, today: Date = new Date()) {
  const todayDate = startOfDay(today);

  if (!child) {
    return { isOnPeriod: false, currentDay: 0, activeCycleId: null };
  }

  const activeCycle = child.cycles.find((cycle: Cycle) => {
    const startDate = startOfDay(toDate(cycle.startDate));
    const endDate = startOfDay(toDate(cycle.endDate));
    return isWithinInterval(todayDate, { start: startDate, end: endDate })
  });

  if (activeCycle) {
    const startDate = startOfDay(toDate(activeCycle.startDate));
    const currentDay = differenceInDays(todayDate, startDate) + 1;
    return { isOnPeriod: true, currentDay, activeCycleId: activeCycle.id };
  }

  return { isOnPeriod: false, currentDay: 0, activeCycleId: null };
}

export function getCyclePrediction(child: Child | null) {
  if (!child || child.cycles.length < 2) {
    return { predictedStartDate: null, daysUntilNextCycle: null };
  }

  // Sort cycles by start date just in case they are not in order
  const sortedCycles = [...child.cycles].sort((a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime());

  let totalCycleLength = 0;
  let cycleCount = 0;

  for (let i = 1; i < sortedCycles.length; i++) {
    const startDate1 = toDate(sortedCycles[i-1].startDate);
    const startDate2 = toDate(sortedCycles[i].startDate);
    const cycleLength = differenceInDays(startDate2, startDate1);
    
    // Simple validation for reasonable cycle lengths
    if (cycleLength > 15 && cycleLength < 60) {
        totalCycleLength += cycleLength;
        cycleCount++;
    }
  }

  if (cycleCount === 0) {
    return { predictedStartDate: null, daysUntilNextCycle: null };
  }

  const averageCycleLength = Math.round(totalCycleLength / cycleCount);
  const lastCycle = sortedCycles[sortedCycles.length - 1];
  const lastStartDate = toDate(lastCycle.startDate);
  
  const predictedStartDate = addDays(lastStartDate, averageCycleLength);
  const daysUntilNextCycle = differenceInDays(predictedStartDate, startOfDay(new Date()));

  return { predictedStartDate, daysUntilNextCycle };
}
