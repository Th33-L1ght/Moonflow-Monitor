'use client';
import type { Child } from "@/lib/types";
import { getCycleStatus } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface FamilyCycleStatusProps {
    children: Child[];
}

export default function FamilyCycleStatus({ children }: FamilyCycleStatusProps) {
  const childProfiles = children.filter(p => !p.isParentProfile);
  const statuses = childProfiles.map(child => ({
    ...child,
    status: getCycleStatus(child),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Child Cycle Status</CardTitle>
        <CardDescription>A quick overview of your children's cycles.</CardDescription>
      </CardHeader>
      <CardContent>
        {statuses.length > 0 ? (
          <ul className="space-y-4">
            {statuses.map(child => (
              <li key={child.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                  <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{child.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {child.status.isOnPeriod
                      ? `On Period - Day ${child.status.currentDay}`
                      : "Not on Period"}
                  </p>
                </div>
                <Badge variant={child.status.isOnPeriod ? 'destructive' : 'secondary'}>
                  {child.status.isOnPeriod ? 'Out' : 'In'}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No child profiles to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
