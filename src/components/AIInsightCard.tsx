'use client';

import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEffect, useState, useCallback } from 'react';
import type { Child } from '@/lib/types';
import { generateCycleInsight } from '@/ai/flows/cycle-insights-flow';
import { Skeleton } from './ui/skeleton';

interface AIInsightCardProps {
  child: Child;
}

const InsightSkeleton = () => (
    <div>
        <Skeleton className="h-4 w-1/3 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
    </div>
)

export function AIInsightCard({ child }: AIInsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = useCallback(async () => {
    // Only fetch if there's at least one cycle with symptoms
    if (child && child.cycles && child.cycles.some(c => c.symptoms.length > 0)) {
      setLoading(true);
      try {
        const result = await generateCycleInsight(child.cycles);
        setInsight(result.insight);
      } catch (error) {
        console.error('Failed to generate insight:', error);
        setInsight("Sorry, I couldn't generate an insight right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    } else {
      setInsight("Log some symptoms during a period to start seeing AI-powered insights here!");
      setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return (
    <Card className="bg-primary/10 border-primary/20 dark:bg-primary/20">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
        <Lightbulb className="h-6 w-6 text-primary" />
        <CardTitle className="text-lg font-headline text-primary/90">AI-Powered Insight</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-primary-foreground/80 min-h-[60px]">
            {loading ? <InsightSkeleton /> : insight}
        </div>
      </CardContent>
    </Card>
  );
}
