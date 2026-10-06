import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join IEEE SGBIT",
  description: "Become an IEEE SGBIT member. Get access to the global IEEE network, workshops, hackathons and leadership opportunities.",
  alternates: { canonical: "/join" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
