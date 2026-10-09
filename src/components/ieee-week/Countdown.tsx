"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ target, end: endAt }: { target: string; end?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const end = new Date(target).getTime();
  const diff = now === null ? 0 : Math.max(0, end - now);
  const live = now !== null && diff === 0;
  const over = live && endAt !== undefined && now !== null && now >= new Date(endAt).getTime();

  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  if (over) return <p className="dd-display text-3xl text-[var(--dd-iron)]">IEEE Week has ended</p>;
  if (live) return <p className="dd-display text-3xl text-[var(--dd-glow)]">IEEE Week is live</p>;

  const cells: [string, string][] = [
    [pad(d), "days"],
    [pad(h), "hours"],
    [pad(m), "minutes"],
    [pad(s), "seconds"],
  ];
  return (
    <div>
      <div className="flex gap-5 sm:gap-8" role="timer" aria-label="Time until IEEE Week begins on 14 October">
        {cells.map(([v, l]) => (
          <div key={l}>
            <p className="dd-display text-4xl leading-none tabular-nums text-[var(--dd-iron)] sm:text-7xl">
              {now === null ? "--" : v}
            </p>
            <p className="mt-1 text-sm text-[var(--dd-iron)]/60">{l}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-[var(--dd-iron)]/70">until IEEE Week begins on 14 October</p>
    </div>
  );
}
