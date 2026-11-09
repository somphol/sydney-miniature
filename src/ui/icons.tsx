import type { SVGProps } from 'react'

export type P = SVGProps<SVGSVGElement> & { size?: number }

const base = ({ size = 16, ...props }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const Sun = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
)
export const Moon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </svg>
)
export const RotateCw = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 7v5h-5" />
    <path d="M19 12a7 7 0 1 0-2 4.9" />
  </svg>
)
export const RotateCcw = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7v5h5" />
    <path d="M5 12a7 7 0 1 1 2 4.9" />
  </svg>
)
export const Plus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const Minus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
)
export const Camera = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
)
export const Maximize = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
  </svg>
)
export const X = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const MapPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
export const ArrowUpRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const MousePointer2 = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 3 6 17 2.5-6.5L20 11Z" />
  </svg>
)
export const Compass = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </svg>
)
