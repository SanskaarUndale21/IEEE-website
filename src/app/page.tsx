import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import EventsPreview from "@/components/EventsPreview";
import Activities from "@/components/Activities";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Preloader />
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <EventsPreview />
      <Activities />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}
