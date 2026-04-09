"use client";

export default function Marquee() {
  const items = [
    "INNOVATION", "TECHNOLOGY", "ENGINEERING", "WORKSHOPS",
    "HACKATHONS", "RESEARCH", "NETWORKING", "IEEE SGBIT",
    "CIRCUITS", "AI / ML", "IOT", "ROBOTICS",
  ];
  const track = items.map((w) => `${w}  ✦  `).join("");

  return (
    <div className="relative overflow-hidden border-y border-gray-200/50 bg-gray-50 py-4 dark:border-white/[0.04] dark:bg-[#080808]">
      <div className="animate-marquee-scroll marquee-track">
        <span className="whitespace-nowrap font-display text-lg font-light tracking-[0.35em] text-gray-300 dark:text-white/[0.06] md:text-xl">
          {track}{track}
        </span>
      </div>
    </div>
  );
}
