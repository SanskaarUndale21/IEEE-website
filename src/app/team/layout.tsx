import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Committee",
  description: "Meet the IEEE SGBIT executive committee and faculty advisor leading the student branch.",
  alternates: { canonical: "/team" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
