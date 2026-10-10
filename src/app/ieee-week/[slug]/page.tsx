import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventPage from "@/components/ieee-week/EventPage";
import { REGISTRABLE } from "@/data/ieeeWeek";

export const dynamicParams = false;

export function generateStaticParams() {
  return REGISTRABLE.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const e = REGISTRABLE.find((x) => x.slug === params.slug);
  if (!e) return {};
  return {
    title: `${e.title} | IEEE Week 2026`,
    description: `${e.title} at IEEE Week, ${e.day} October 2026, ${e.venue}. ${e.tagline}`,
    alternates: { canonical: `/ieee-week/${e.slug}` },
    openGraph: { images: [`/images/ieee-week/rulebook/${e.slug}-banner.webp`] },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!REGISTRABLE.some((e) => e.slug === params.slug)) notFound();
  return <EventPage slug={params.slug} />;
}
