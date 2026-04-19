"use client";

import Image from "next/image";
import Link from "next/link";
import { SOCIAL, IMAGES, SITE } from "@/constants";

const quickLinks = [
  { name: "Home",    href: "/" },
  { name: "About",   href: "/about" },
  { name: "Events",  href: "/events" },
  { name: "Team",    href: "/team" },
  { name: "Contact", href: "#contact" },
];

const ieeeResources = [
  { name: "IEEE.org",      url: "https://www.ieee.org" },
  { name: "IEEE Xplore",   url: "https://ieeexplore.ieee.org" },
  { name: "IEEE Spectrum", url: "https://spectrum.ieee.org" },
  { name: "IEEE Standards",url: "https://standards.ieee.org" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/60 bg-gray-50 dark:border-white/[0.04] dark:bg-[#060606]">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-12">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <Image src={IMAGES.logo} alt="IEEE" width={34} height={34} className="object-contain" />
              <div>
                <p className="font-display text-sm font-bold tracking-[0.15em] text-gray-900 dark:text-white">IEEE</p>
                <p className="text-[9px] tracking-[0.25em] text-gray-500 dark:text-white/40">SGBIT BELAGAVI</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-white/35">
              Advancing technology for the benefit of humanity — IEEE Student Branch at {SITE.collegeName}.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-500 transition-colors hover:text-ieee-light dark:text-white/40 dark:hover:text-ieee-light">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* IEEE Resources */}
          <div>
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">IEEE Resources</h4>
            <ul className="space-y-3">
              {ieeeResources.map((link) => (
                <li key={link.name}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 transition-colors hover:text-ieee-light dark:text-white/40 dark:hover:text-ieee-light">
                    {link.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">Follow Us</h4>
            <div className="flex gap-3">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-ieee-light hover:bg-ieee-light/10 dark:border-white/10 dark:hover:border-ieee-light">
                <Image src={IMAGES.instagram} alt="Instagram" width={18} height={18} className="opacity-60 transition-opacity hover:opacity-100" />
              </a>
              <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-ieee-light hover:bg-ieee-light/10 dark:border-white/10 dark:hover:border-ieee-light">
                <Image src={IMAGES.linkedin} alt="LinkedIn" width={18} height={18} className="opacity-60 transition-opacity hover:opacity-100" />
              </a>
            </div>
            <div className="mt-5">
              <p className="text-xs text-gray-400 dark:text-white/25">
                {SITE.collegeName}
                <br />
                {SITE.location}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200/60 pt-8 dark:border-white/[0.04] sm:flex-row">
          <p className="text-[10px] tracking-[0.15em] text-gray-400 dark:text-white/25">
            © {new Date().getFullYear()} {SITE.name} Student Branch. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Image src={IMAGES.logo} alt="IEEE" width={18} height={18} className="opacity-40" />
              <span className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/20">A unit of IEEE</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src="/images/sgbit_logo-removebg-preview.png" alt="SGBIT" width={18} height={18} className="opacity-40" />
              <span className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/20">SGBIT Belagavi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
