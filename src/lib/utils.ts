import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Child } from "@/lib/types";
import { differenceInDays, isWithinInterval } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCycleStatus(child: Child, today: Date = new Date()) {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const activeCycle = child.cycles.find(cycle => 
    isWithinInterval(todayDate, { start: cycle.startDate, end: cycle.endDate })
  );

  if (activeCycle) {
    const currentDay = differenceInDays(todayDate, activeCycle.startDate) + 1;
    return { isOnPeriod: true, currentDay };
  }

  return { isOnPeriod: false, currentDay: 0 };
}
