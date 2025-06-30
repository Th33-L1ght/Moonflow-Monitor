'use client';
import { PadsButterflyIcon } from './PadsButterflyIcon';

export function FlyingButterflies() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="butterfly-container">
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
        <PadsButterflyIcon className="butterfly text-primary/30" />
      </div>
    </div>
  );
}
