import { Activity } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Activity className="h-6 w-6" />
      <span className="font-bold text-2xl text-foreground">CycleTrack</span>
    </div>
  )
}
