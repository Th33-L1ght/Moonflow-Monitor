import * as React from "react"

export const PadsButterflyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Body (Tampon) */}
    <rect x={11} y={2} width={2} height={18} rx={1} />
    <path d="M12 20v2" />

    {/* Left Wing (Pad) */}
    <path d="M11 7c-4 1-6 3-6 5s2 4 6 5" />
    <path d="M7 9.5c-2 0-2 5 0 5" />

    {/* Right Wing (Pad) */}
    <path d="M13 7c4 1 6 3 6 5s-2 4-6 5" />
    <path d="M17 9.5c2 0 2 5 0 5" />
  </svg>
)
