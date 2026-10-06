/** Original illustration: a hooded, masked tyrant. Eye slits glow. */
export default function Doom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 620" className={className} aria-hidden>
      <defs>
        <linearGradient id="doom-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14724c" />
          <stop offset="0.55" stopColor="#0b3d2a" />
          <stop offset="1" stopColor="#04110c" />
        </linearGradient>
        <linearGradient id="doom-iron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d3dbe0" />
          <stop offset="0.5" stopColor="#7d8992" />
          <stop offset="1" stopColor="#3f4950" />
        </linearGradient>
        <linearGradient id="doom-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0cd6a" />
          <stop offset="1" stopColor="#8d6a1c" />
        </linearGradient>
        <radialGradient id="doom-hood-shadow" cx="50%" cy="42%" r="50%">
          <stop offset="0.55" stopColor="#020806" stopOpacity="0.95" />
          <stop offset="1" stopColor="#020806" stopOpacity="0" />
        </radialGradient>
        <filter id="doom-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* cloak */}
      <path
        d="M200 14 C118 14 66 88 66 170 C66 232 88 268 54 334 C24 398 8 490 0 620 L400 620 C392 490 376 398 346 334 C312 268 334 232 334 170 C334 88 282 14 200 14Z"
        fill="url(#doom-cloak)"
      />
      {/* cloak folds */}
      <g fill="none" stroke="#052a1c" strokeWidth="3" strokeOpacity="0.8">
        <path d="M70 330 C60 430 52 520 46 620" />
        <path d="M118 360 C108 450 100 540 96 620" />
        <path d="M330 330 C340 430 348 520 354 620" />
        <path d="M282 360 C292 450 300 540 304 620" />
      </g>
      <ellipse cx="200" cy="170" rx="150" ry="170" fill="url(#doom-hood-shadow)" />

      {/* faceplate */}
      <path
        d="M200 62 C150 62 122 108 122 160 C122 214 150 252 200 266 C250 252 278 214 278 160 C278 108 250 62 200 62Z"
        fill="url(#doom-iron)"
      />
      <path d="M200 62 C150 62 122 108 122 160 C122 214 150 252 200 266" fill="none" stroke="#e8eef1" strokeOpacity="0.5" strokeWidth="2" />
      {/* brow plate */}
      <path d="M128 132 Q200 104 272 132 L268 146 Q200 122 132 146Z" fill="#59656d" />
      {/* eyes */}
      <g filter="url(#doom-glow)" className="dd-eye">
        <path d="M148 154 L186 163 L182 173 L150 166Z" fill="#3be39a" />
        <path d="M252 154 L214 163 L218 173 L250 166Z" fill="#3be39a" />
      </g>
      {/* nose and mouth */}
      <path d="M200 176 L194 214 L200 220 L206 214Z" fill="#2b343a" />
      <g fill="#2b343a">
        <rect x="170" y="234" width="60" height="3" rx="1.5" />
        <rect x="178" y="241" width="44" height="2.5" rx="1.2" />
      </g>
      {/* rivets */}
      <g fill="#c9d2d7" fillOpacity="0.8">
        <circle cx="136" cy="190" r="3" />
        <circle cx="264" cy="190" r="3" />
        <circle cx="146" cy="214" r="2.5" />
        <circle cx="254" cy="214" r="2.5" />
      </g>

      {/* shoulder guards and clasp */}
      <path d="M96 336 Q200 296 304 336 L312 372 Q200 336 88 372Z" fill="url(#doom-gold)" />
      <path d="M96 336 Q200 296 304 336" fill="none" stroke="#fff3c4" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M170 322 L230 322 L218 372 L182 372Z" fill="#05140d" />
      <circle cx="200" cy="348" r="13" fill="url(#doom-gold)" />
      <circle cx="200" cy="348" r="5" fill="#3be39a" filter="url(#doom-glow)" />
    </svg>
  );
}
