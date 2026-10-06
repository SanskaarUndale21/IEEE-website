import { getEvents } from "@/lib/events";
import EventsList from "./EventsList";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  return <EventsList events={await getEvents("past")} />;
}
