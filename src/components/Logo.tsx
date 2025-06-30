import { Droplets } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Droplets className="h-6 w-6 text-accent" />
      <span className="font-bold font-headline text-lg text-foreground">Moonflow</span>
    </div>
  )
}
