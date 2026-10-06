import { getEvents } from "@/lib/events";
import EventsList from "../EventsList";
import UpcomingEmpty from "./UpcomingEmpty";

export const dynamic = "force-dynamic";

export default async function UpcomingEventsPage() {
  const events = await getEvents("upcoming");
  if (events.length === 0) return <UpcomingEmpty />;
  return <EventsList events={events} heading="UPCOMING EVENTS" />;
}
