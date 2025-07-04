import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Child, type Cycle } from "@/lib/types";
import { differenceInDays, isWithinInterval, startOfDay, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This utility is designed to run on the client, where dates from the server
// arrive as strings. It ensures they are converted back to Date objects.
export const toDate = (date: Date | string): Date => {
  // If it's already a Date object, return it.
  if (date instanceof Date) {
    return date;
  }
  // Otherwise, it's a string from server serialization.
  return new Date(date);
};

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

export async function resizeImage(dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);

            // Get the data URL with JPEG compression for better file size
            resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality
        };
        img.onerror = (error) => {
            reject(error);
        };
    });
}
