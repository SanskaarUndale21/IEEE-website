import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events";
import EventDetail from "./EventDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const found = await getEventBySlug(params.slug);
  if (!found) return { title: "Event Not Found | IEEE SGBIT" };
  return { title: `${found.event.title} | IEEE SGBIT`, description: found.event.description };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const found = await getEventBySlug(params.slug);
  if (!found) notFound();
  return <EventDetail event={found.event} events={found.siblings} />;
}
