'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Child } from '@/lib/types';
import { getCycleStatus } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ChildStatusCardProps {
  child: Child;
}

export function ChildStatusCard({ child }: ChildStatusCardProps) {
  const { isOnPeriod, currentDay } = getCycleStatus(child);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="font-headline text-xl">{child.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-3 rounded-md border p-3">
          <span
            className={cn(
              'h-3 w-3 rounded-full animate-pulse',
              isOnPeriod ? 'bg-red-500' : 'bg-green-500'
            )}
          />
          <div className="flex-1">
            <p className="text-sm font-medium leading-none">
              {isOnPeriod ? `Day ${currentDay} of Period` : 'Not on Period'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isOnPeriod ? 'Currently on cycle' : 'Between cycles'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/child/${child.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
