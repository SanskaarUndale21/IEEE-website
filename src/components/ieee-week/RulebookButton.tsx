import { RULEBOOK_PDF } from "@/data/ieeeWeek";

/** Downloads the full IEEE Week rulebook (banners and rules for all events). */
export default function RulebookButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={RULEBOOK_PDF.href}
      download="IEEE-Week-2026-Rulebook.pdf"
      className={`dd-btn dd-display flex min-h-14 w-full items-center justify-center border border-[var(--dd-iron)]/40 px-6 text-xl text-[var(--dd-iron)] transition-colors hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)] sm:inline-flex sm:w-fit ${className}`}
    >
      Download rulebook (PDF, {RULEBOOK_PDF.size})
    </a>
  );
}
