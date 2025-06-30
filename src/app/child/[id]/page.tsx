import { Header } from '@/components/Header';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { SymptomTracker } from '@/components/SymptomTracker';
import { CycleInfo } from '@/components/CycleInfo';
import { mockChildren } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const child = mockChildren.find((c) => c.id === params.id);

  if (!child) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 flex items-center gap-4">
             <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
                <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold font-headline">{child.name}'s Cycle</h1>
                <p className="text-muted-foreground">Log symptoms and view cycle history.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-8">
              <PeriodCalendar child={child} />
              <CycleInfo child={child} />
            </div>
            <div className="lg:col-span-1">
              <SymptomTracker />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
