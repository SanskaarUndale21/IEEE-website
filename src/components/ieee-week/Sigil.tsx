/** Original rune sigil: concentric rings, tick marks and a ring of runes. */
const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

export default function Sigil({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 72 });
  return (
    <svg viewBox="-300 -300 600 600" className={className} aria-hidden>
      <defs>
        <path id="dd-rune-ring" d="M0,-214 a214,214 0 1,1 -0.01,0" />
        <radialGradient id="dd-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3be39a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3be39a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="290" fill="url(#dd-core)" />
      <g className="dd-spin-slow" fill="none" stroke="#3be39a" strokeOpacity="0.55">
        <circle r="286" strokeWidth="1" />
        <circle r="262" strokeWidth="0.6" strokeDasharray="3 9" />
        {ticks.map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="-270"
            x2="0"
            y2={i % 6 === 0 ? -252 : -262}
            strokeWidth={i % 6 === 0 ? 1.4 : 0.7}
            transform={`rotate(${i * 5})`}
          />
        ))}
      </g>
      <g className="dd-spin-rev">
        <text fontSize="26" fill="#d9ac3f" fillOpacity="0.85" letterSpacing="9">
          <textPath href="#dd-rune-ring">{RUNES + RUNES.slice(0, 8)}</textPath>
        </text>
        <circle r="236" fill="none" stroke="#d9ac3f" strokeOpacity="0.4" strokeWidth="0.8" />
        <circle r="190" fill="none" stroke="#a9b3ba" strokeOpacity="0.35" strokeWidth="0.8" />
      </g>
      <g className="dd-spin-slow" fill="none" stroke="#a9b3ba" strokeOpacity="0.4" strokeWidth="0.8">
        <polygon points="0,-170 147,85 -147,85" />
        <polygon points="0,170 147,-85 -147,-85" />
        <circle r="60" stroke="#3be39a" strokeOpacity="0.7" />
      </g>
    </svg>
  );
}
