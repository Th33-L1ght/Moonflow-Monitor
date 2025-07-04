'use client';

import type { Child } from '@/lib/types';
import { getCycleStatus } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface FamilyCycleStatusProps {
  children: Child[];
}

export function FamilyCycleStatus({ children }: FamilyCycleStatusProps) {
  const router = useRouter();

  if (children.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Cycle Status</CardTitle>
        <CardDescription>An at-a-glance view of everyone's current cycle.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children.map(child => {
            const { isOnPeriod, currentDay } = getCycleStatus(child);
            const statusText = isOnPeriod ? `On Period - Day ${currentDay}` : 'Not on Period';
            const statusColor = isOnPeriod ? 'destructive' : 'secondary';

            return (
              <div key={child.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <Badge variant={statusColor} className="mt-1">{statusText}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/child/${child.id}`)} className="w-full sm:w-auto">
                  View Details
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
