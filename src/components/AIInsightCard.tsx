
'use client';

import { PadsButterflyIcon as Butterfly } from '@/components/PadsButterflyIcon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useEffect, useState, useCallback } from 'react';
import type { Child } from '@/lib/types';
// import { generateCycleInsight } from '@/ai/flows/cycle-insights-flow';
import { Skeleton } from './ui/skeleton';

interface AIInsightCardProps {
  child: Child;
}

// Temporarily disabled to resolve deployment issues.
export function AIInsightCard({ child }: AIInsightCardProps) {
    return null;
}

