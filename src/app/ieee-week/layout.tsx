import type { Metadata } from "next";
import { Big_Shoulders_Display, Spectral } from "next/font/google";
import "./doomsday.css";

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-big-shoulders",
  display: "swap",
});
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IEEE Week: Doomsday Edition",
  description:
    "Four days, six events. IEEE Week at IEEE SGBIT, Belagavi: workshops, a hackathon, showcases, a quiz and the awards.",
  alternates: { canonical: "/ieee-week" },
};

export default function IeeeWeekLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dd-root ${bigShoulders.variable} ${spectral.variable}`}>{children}</div>;
}
