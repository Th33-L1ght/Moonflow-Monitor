import { PadsButterflyIcon as Butterfly } from "@/components/PadsButterflyIcon";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Butterfly className="h-12 w-12 text-primary" />
      <span className="font-body font-bold text-3xl text-foreground">Light Flo</span>
    </div>
  )
}
