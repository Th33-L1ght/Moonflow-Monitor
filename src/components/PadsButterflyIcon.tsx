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
    <path d="M12 2v20" />
    <path d="M10 4c-2 0-4-1-4-2" />
    <path d="M14 4c2 0 4-1 4-2" />
    <path d="M12 7c-4 0-8 1-8 5s4 5 8 5" />
    <path d="M12 7c4 0 8 1 8 5s-4 5-8 5" />
    <path d="M12 12c-4 0-7 1-7 3s3 3 7 3" />
    <path d="M12 12c4 0 7 1 7 3s-3 3-7 3" />
  </svg>
)
