import * as React from "react"

const UterusIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M16.25 10.25a4.25 4.25 0 1 0-8.5 0c0 3.375 4.25 12 4.25 12s4.25-8.625 4.25-12Z" />
    <path d="M6 10.25h.5M17.5 10.25h-2M4 14.25h1.5M18.5 14.25H20M5.5 18.25h13" />
  </svg>
)

export default UterusIcon
