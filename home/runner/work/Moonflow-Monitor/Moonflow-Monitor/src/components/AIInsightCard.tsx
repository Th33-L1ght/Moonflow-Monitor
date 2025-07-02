
'use client';

import { PadsButterflyIcon as Butterfly } from '@/components/PadsButterflyIcon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEffect, useState, useCallback } from 'react';
import type { Child } from '@/lib/types';
import { generateCycleInsight } from '@/ai/flows/cycle-insights-flow';
import { Skeleton } from './ui/skeleton';

interface AIInsightCardProps {
  child: Child;
}

export function AIInsightCard({ child }: AIInsightCardProps) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsight = useCallback(async () => {
    if (!child || child.cycles.length < 1) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await generateCycleInsight(child.cycles);
      setInsight(result.insight);
    } catch (e) {
      console.error('Failed to generate AI insight:', e);
      setError('Could not generate an insight at this time.');
    } finally {
      setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    // Only fetch insight if there are cycles to analyze.
    if (child.cycles && child.cycles.length > 0) {
        fetchInsight();
    } else {
        setLoading(false);
    }
  }, [fetchInsight, child.cycles]);

  if (child.cycles.length < 1) {
    return null; // Don't show the card if there's no data to analyze
  }

  return (
    <Card className="bg-accent/20 border-accent/30">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Butterfly className="h-5 w-5 text-accent-foreground" />
        <CardTitle className="text-md font-semibold text-accent-foreground">AI Insight</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-5 w-3/4" />}
        {!loading && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && (
          <p className="text-sm text-foreground/80">{insight}</p>
        )}
      </CardContent>
    </Card>
  );
}
