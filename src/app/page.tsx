import { Bell, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ChildStatusCard } from '@/components/ChildStatusCard';
import { mockChildren } from '@/lib/mock-data';

export default function DashboardPage() {
  const childrenWithSevereSymptoms = mockChildren.filter(child =>
    child.cycles.some(cycle =>
      cycle.symptoms.some(symptom => symptom.crampLevel > 2)
    )
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your family's cycles.</p>
          </div>

          {childrenWithSevereSymptoms.length > 0 && (
            <Card className="mb-8 bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  <Bell className="h-4 w-4" />
                  Urgent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-pink-800 dark:text-pink-200">
                  Severe symptoms reported
                </div>
                <p className="text-xs text-pink-600 dark:text-pink-400">
                  {childrenWithSevereSymptoms.map(c => c.name).join(', ')} reported strong cramps or mood swings.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockChildren.map((child) => (
              <ChildStatusCard key={child.id} child={child} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
