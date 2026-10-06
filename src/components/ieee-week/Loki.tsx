/**
 * Original illustration: a horned trickster holding a glowing thread.
 * The bottom of the figure is where the timeline line begins (x = 50%).
 */
export default function Loki({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 520" className={className} aria-hidden>
      <defs>
        <linearGradient id="lk-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc86" />
          <stop offset="0.6" stopColor="#c99a2e" />
          <stop offset="1" stopColor="#6e5014" />
        </linearGradient>
        <linearGradient id="lk-cloth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f5a3b" />
          <stop offset="1" stopColor="#04140d" />
        </linearGradient>
        <linearGradient id="lk-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d5d0" />
          <stop offset="1" stopColor="#7e8d88" />
        </linearGradient>
        <filter id="lk-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* shoulders and cape */}
      <path d="M200 300 C130 300 70 322 40 372 C20 408 10 450 6 520 L394 520 C390 450 380 408 360 372 C330 322 270 300 200 300Z" fill="url(#lk-cloth)" />
      <path d="M200 300 C150 304 118 322 100 352 L200 420 L300 352 C282 322 250 304 200 300Z" fill="#06180f" />
      {/* gold collar */}
      <path d="M118 332 Q200 296 282 332 L270 352 Q200 322 130 352Z" fill="url(#lk-gold)" />

      {/* neck and face */}
      <path d="M176 262 L176 306 Q200 322 224 306 L224 262Z" fill="#6a7873" />
      <path d="M200 120 C158 120 140 156 142 198 C144 238 168 272 200 282 C232 272 256 238 258 198 C260 156 242 120 200 120Z" fill="url(#lk-skin)" />
      {/* hair swept back */}
      <path d="M142 190 C132 150 150 108 200 100 C250 108 268 150 258 190 C252 160 232 138 200 136 C168 138 148 160 142 190Z" fill="#050a08" />
      <path d="M142 190 C138 230 150 262 168 282 C150 262 138 236 142 190Z" fill="#050a08" />
      <path d="M258 190 C262 230 250 262 232 282 C250 262 262 236 258 190Z" fill="#050a08" />
      {/* eyes and smirk */}
      <g filter="url(#lk-glow)">
        <path d="M168 190 L190 194 L188 200 L170 197Z" fill="#3be39a" />
        <path d="M232 190 L210 194 L212 200 L230 197Z" fill="#3be39a" />
      </g>
      <path d="M198 206 L194 232" stroke="#55635e" strokeWidth="3" strokeLinecap="round" />
      <path d="M180 250 Q204 262 226 244" fill="none" stroke="#2c3733" strokeWidth="3" strokeLinecap="round" />

      {/* helmet crown */}
      <path d="M146 150 C148 112 172 92 200 92 C228 92 252 112 254 150 L244 144 C236 120 220 108 200 108 C180 108 164 120 156 144Z" fill="url(#lk-gold)" />
      <path d="M194 92 L200 56 L206 92Z" fill="url(#lk-gold)" />
      {/* horns */}
      <path d="M150 128 C112 118 82 82 80 20 C98 62 124 84 160 100Z" fill="url(#lk-gold)" />
      <path d="M250 128 C288 118 318 82 320 20 C302 62 276 84 240 100Z" fill="url(#lk-gold)" />
      <path d="M80 20 C98 62 124 84 160 100" fill="none" stroke="#fff3c4" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M320 20 C302 62 276 84 240 100" fill="none" stroke="#fff3c4" strokeOpacity="0.55" strokeWidth="1.5" />
      {/* cheek guards */}
      <path d="M142 190 L132 236 L152 252Z" fill="url(#lk-gold)" />
      <path d="M258 190 L268 236 L248 252Z" fill="url(#lk-gold)" />

      {/* arms down to the thread */}
      <path d="M96 352 C86 400 118 450 176 486 L196 470 C150 440 128 396 134 346Z" fill="url(#lk-cloth)" />
      <path d="M304 352 C314 400 282 450 224 486 L204 470 C250 440 272 396 266 346Z" fill="url(#lk-cloth)" />
      {/* fists gripping the glowing thread */}
      <g fill="#0c3a27" stroke="#c99a2e" strokeWidth="2">
        <rect x="170" y="476" width="30" height="28" rx="9" />
        <rect x="200" y="476" width="30" height="28" rx="9" />
      </g>
      <rect x="198" y="470" width="4" height="50" fill="#3be39a" filter="url(#lk-glow)" />
    </svg>
  );
}
