import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Child, type Cycle } from "@/lib/types";
import { differenceInDays, isWithinInterval, startOfDay } from "date-fns";
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
