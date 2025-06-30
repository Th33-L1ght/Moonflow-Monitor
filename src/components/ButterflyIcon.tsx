import * as React from "react"

export const ButterflyIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M13 18a2.4 2.4 0 0 0 3 1a2.4 2.4 0 0 0 3-1V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2Z"/>
    <path d="m5 19 1-9-1-9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2Z"/>
    <path d="M12 2v20"/>
  </svg>
)
