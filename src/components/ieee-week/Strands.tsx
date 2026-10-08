/**
 * Hundreds of dark green strands radiating from one point (the figure's feet).
 * Seeded so server and client render the same markup.
 */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type S = { d: string; w: number; o: number; c: string };

function build(count: number, seed: number, ox: number, oy: number, minL: number, maxL: number): S[] {
  const r = rng(seed);
  const palette = ["#0c5a3c", "#0f7a4e", "#0a4a40", "#12935e", "#0b3d3a"];
  return Array.from({ length: count }, () => {
    // fan out mostly sideways and upward, like roots pulled taut
    const a = (r() * 1.7 - 0.85) * Math.PI + (r() < 0.5 ? 0 : Math.PI) - Math.PI / 2 + (r() - 0.5) * 0.6;
    const L = minL + r() * (maxL - minL);
    const ex = ox + Math.cos(a) * L;
    const ey = oy + Math.sin(a) * L;
    const bend = (r() - 0.5) * L * 0.55;
    const mx = (ox + ex) / 2 + Math.cos(a + Math.PI / 2) * bend;
    const my = (oy + ey) / 2 + Math.sin(a + Math.PI / 2) * bend;
    return {
      d: `M${ox.toFixed(1)} ${oy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      w: 0.5 + r() * 1.3,
      o: 0.18 + r() * 0.5,
      c: palette[Math.floor(r() * palette.length)],
    };
  });
}

const BACK = build(150, 7, 500, 860, 420, 1500);
const FRONT = build(26, 21, 500, 900, 300, 900);
const LIVE = build(7, 99, 500, 860, 700, 1500);

export default function Strands({ front = false, className = "" }: { front?: boolean; className?: string }) {
  const list = front ? FRONT : BACK;
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <g className="dd-sway" style={{ transformOrigin: "500px 860px" }}>
        {list.map((s, i) => (
          <path key={i} d={s.d} fill="none" stroke={s.c} strokeWidth={s.w} strokeOpacity={front ? s.o * 0.7 : s.o} strokeLinecap="round" />
        ))}
        {!front &&
          LIVE.map((s, i) => (
            <path
              key={`l${i}`}
              d={s.d}
              fill="none"
              stroke={i % 3 === 0 ? "#d65bff" : "#46f0a0"}
              strokeWidth="1.1"
              strokeOpacity="0.9"
              strokeLinecap="round"
              strokeDasharray="6 140"
              className="dd-flow"
              style={{ animationDelay: `${i * -1.3}s`, filter: "drop-shadow(0 0 4px currentColor)" }}
            />
          ))}
      </g>
    </svg>
  );
}
