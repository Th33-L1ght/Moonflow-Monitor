import { PadsButterflyIcon as Butterfly } from "@/components/PadsButterflyIcon";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Butterfly className="h-6 w-6 text-primary" />
      <span className="font-bold text-2xl text-foreground">Light Flow</span>
    </div>
  )
}
