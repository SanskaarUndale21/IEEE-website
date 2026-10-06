/** Original line emblems: a heroic arsenal, one per event. Stroke only, inherits colour. */
type P = { className?: string };
const base = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** Round shield: concentric rings and a five point star. */
export const Shield = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="32" cy="32" r="27" />
    <circle cx="32" cy="32" r="19" />
    <circle cx="32" cy="32" r="8" />
    <path d="M32 14l4.2 12.4h13l-10.5 7.6 4 12.4L32 38.8 21.3 46.4l4-12.4-10.5-7.6h13z" strokeWidth="1.6" />
  </svg>
);

/** Mallet with a leather bound grip. */
export const Hammer = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="10" y="9" width="36" height="18" rx="3" />
    <path d="M18 9v18M38 9v18" strokeWidth="1.6" />
    <path d="M28 27v30" />
    <path d="M25 40h6M25 46h6M25 52h6" strokeWidth="1.6" />
  </svg>
);

/** Reactor ring. */
export const Reactor = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="32" cy="32" r="26" />
    <circle cx="32" cy="32" r="14" />
    <circle cx="32" cy="32" r="5" fill="currentColor" />
    {Array.from({ length: 10 }).map((_, i) => (
      <line key={i} x1="32" y1="9" x2="32" y2="18" strokeWidth="2.6" transform={`rotate(${i * 36} 32 32)`} />
    ))}
  </svg>
);

/** Sorcerer mandala. */
export const Mandala = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="32" cy="32" r="27" />
    <circle cx="32" cy="32" r="20" strokeDasharray="2 4" />
    <path d="M32 6L56 50H8z" strokeWidth="1.6" />
    <path d="M32 58L8 14h48z" strokeWidth="1.6" />
    <circle cx="32" cy="32" r="6" />
  </svg>
);

/** Faceplate. */
export const Mask = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M32 6C20 6 12 16 12 28c0 12 8 21 20 26 12-5 20-14 20-26C52 16 44 6 32 6z" />
    <path d="M18 26l11 3-1.5 4L19 31zM46 26l-11 3 1.5 4L45 31z" fill="currentColor" />
    <path d="M32 33l-2 10h4zM26 47h12" />
  </svg>
);

/** Horned helm. */
export const Helm = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M18 38c-9-3-14-13-14-28 4 11 10 16 18 18M46 38c9-3 14-13 14-28-4 11-10 16-18 18" />
    <path d="M18 34c0-12 6-20 14-20s14 8 14 20l-4 14H22z" />
    <path d="M32 14V4M24 34l6 3M40 34l-6 3" />
  </svg>
);

export const EMBLEMS = [Shield, Hammer, Reactor, Mandala, Mask, Helm];
