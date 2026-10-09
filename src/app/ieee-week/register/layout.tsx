import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register for IEEE Week",
  description: "Register your team for an IEEE Week event at IEEE SGBIT.",
  robots: { index: false, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
