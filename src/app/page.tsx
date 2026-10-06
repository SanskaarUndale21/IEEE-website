import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import EventsPreview from "@/components/EventsPreview";
import Activities from "@/components/Activities";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getEvents("past");
  return (
    <main className="relative">
      <Preloader />
      <Hero />
      <Marquee />
      <About />
      <EventsPreview events={events} />
      <Activities />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}
