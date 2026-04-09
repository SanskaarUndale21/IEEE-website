import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Events | IEEE SGBIT",
  description: "Explore all events organized by IEEE Student Branch SGBIT Belagavi.",
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
