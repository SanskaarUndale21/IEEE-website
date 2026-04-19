"use client";

export default function Marquee() {
  const items = [
    "INNOVATION", "TECHNOLOGY", "ENGINEERING", "WORKSHOPS",
    "HACKATHONS", "RESEARCH", "NETWORKING", "IEEE SGBIT",
    "CIRCUITS", "AI / ML", "IOT", "ROBOTICS",
  ];
  const track = items.map((w) => `${w}  ✦  `).join("");

  return (
    <div className="relative overflow-hidden border-y border-gray-200/60 bg-gray-100/80 py-3.5 dark:border-white/[0.04] dark:bg-[#080808]">
      <div className="animate-marquee-scroll marquee-track">
        <span className="whitespace-nowrap font-display text-base font-light tracking-[0.35em] text-gray-400/70 dark:text-white/[0.06] md:text-lg">
          {track}{track}
        </span>
      </div>
    </div>
  );
}
