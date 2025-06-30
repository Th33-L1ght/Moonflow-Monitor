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
    <rect x={11} y={3} width={2} height={18} rx={1} />
    <path d="M12 21v2" />
    <path d="M11 5C4.5 6.5 2 9.5 2 12s2.5 5.5 9 7" />
    <path d="M6.5 9.5c-1.5 0-1.5 5 0 5" />
    <path d="M13 5c6.5 1.5 9 4.5 9 7s-2.5 5.5-9 7" />
    <path d="M17.5 9.5c1.5 0 1.5 5 0 5" />
  </svg>
)
