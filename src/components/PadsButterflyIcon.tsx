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

    {/* Wings */}
    <path d="M12 9c-5-2-8-1-8 4s3 6 8 4" />
    <path d="M12 9c5-2 8-1 8 4s-3 6-8 4" />

    {/* Antennae */}
    <path d="M10 5L8.5 3" />
    <path d="M14 5l1.5-2" />
  </svg>
)
