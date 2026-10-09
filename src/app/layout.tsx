import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";
import SmoothScroll from "@/context/SmoothScroll";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ieee-sgbit.vercel.app";
const DESCRIPTION =
  "Official website of IEEE Student Branch at S.G. Balekundri Institute of Technology, Belagavi. Workshops, hackathons, conferences and a community of student engineers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "IEEE SGBIT | Student Branch, Belagavi", template: "%s | IEEE SGBIT" },
  description: DESCRIPTION,
  applicationName: "IEEE SGBIT",
  keywords: ["IEEE", "IEEE SGBIT", "SGBIT", "Student Branch", "Belagavi", "Engineering", "Technology", "Hackathon", "Workshops"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "IEEE SGBIT",
    locale: "en_IN",
    url: "/",
    title: "IEEE SGBIT | Student Branch, Belagavi",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "IEEE SGBIT | Student Branch, Belagavi", description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "IEEE SGBIT Student Branch",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description: DESCRIPTION,
  parentOrganization: { "@type": "Organization", name: "S.G. Balekundri Institute of Technology" },
  address: { "@type": "PostalAddress", addressLocality: "Belagavi", addressRegion: "Karnataka", addressCountry: "IN" },
  sameAs: ["https://www.instagram.com/ieee_sgbit/", "https://www.linkedin.com/company/ieee-sgbit/"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SmoothScroll>
            <Navbar />
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
