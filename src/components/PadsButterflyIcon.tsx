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

    {/* Wings (Pads) */}
    <path d="M11 7c-4 1-5 5-5 5s1 4 5 5" />
    <path d="M13 7c4 1 5 5 5 5s-1 4-5 5" />

    {/* Antennae */}
    <path d="M10 5L8.5 3" />
    <path d="M14 5l1.5-2" />
  </svg>
)
