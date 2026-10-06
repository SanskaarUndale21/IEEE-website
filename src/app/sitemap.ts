import type { MetadataRoute } from "next";
import { events } from "@/data/events";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ieee-sgbit.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/about", "/team", "/ieee-week", "/join"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const eventPages = events.map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  return [...pages, ...eventPages];
}
