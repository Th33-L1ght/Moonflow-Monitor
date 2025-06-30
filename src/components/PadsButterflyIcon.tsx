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
    {/* Tampon Body */}
    <path d="M12 4v16" />

    {/* Top Wings (Pads) */}
    <path d="M11 6c-3 0-5 1-5 4 0 3 2 4 5 4" />
    <path d="M13 6c3 0 5 1 5 4 0 3-2 4-5 4" />
    
    {/* Bottom Wings (Pads) */}
    <path d="M11 18c-3 0-5-1-5-4 0-3 2-4 5-4" />
    <path d="M13 18c3 0 5-1 5-4 0-3-2-4-5-4" />

    {/* Antennae */}
    <path d="M10 5L8.5 3" />
    <path d="M14 5l1.5-2" />
  </svg>
)
