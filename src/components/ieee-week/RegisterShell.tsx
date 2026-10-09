"use client";

import Image from "next/image";
import Link from "next/link";
import { DOOM_MASK } from "@/data/ieeeWeek";
import { useDarkTheme } from "./useDarkTheme";

const STEPS = ["Details", "WhatsApp", "Payment"];

/** Shared frame for the three registration pages: banner, step bar, content. */
export default function RegisterShell({ step, title, children }: { step: 1 | 2 | 3; title: string; children: React.ReactNode }) {
  useDarkTheme();
  return (
    <main className="relative min-h-screen pb-24">
      <div className="relative flex min-h-[15rem] items-end overflow-hidden pt-24 md:min-h-[17rem]">
        <Image src={DOOM_MASK.src} alt="" fill priority sizes="100vw" className="object-cover object-[62%_50%]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02070a] via-[#02070a]/45 to-[#02070a]/70" />
        <div className="relative mx-auto w-full max-w-3xl px-5 pb-6 md:px-0">
          <Link href="/ieee-week#details" className="dd-link text-sm text-[var(--dd-iron)]/75 underline underline-offset-2 hover:text-[var(--dd-glow)]">
            Back to IEEE Week
          </Link>
          <h1 className="dd-display mt-2 text-5xl leading-none text-[var(--dd-iron)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-6xl">{title}</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-5 md:px-0">
        <ol className="mb-10 mt-6 grid grid-cols-3 gap-2" aria-label="Registration steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "now" : "next";
            return (
              <li key={label} aria-current={state === "now" ? "step" : undefined}>
                <div className={`h-1.5 ${state === "next" ? "bg-[var(--dd-iron)]/20" : "bg-[var(--dd-glow)]"}`} />
                <p className={`mt-2 text-sm ${state === "now" ? "text-[var(--dd-glow)]" : "text-[var(--dd-iron)]/60"}`}>
                  {n}. {label}
                </p>
              </li>
            );
          })}
        </ol>
        {children}
      </div>
    </main>
  );
}
