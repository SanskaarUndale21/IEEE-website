import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about IEEE SGBIT, our mission, values and journey since 2014 at S.G. Balekundri Institute of Technology, Belagavi.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
