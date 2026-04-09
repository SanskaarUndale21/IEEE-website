"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/50 bg-gray-50 dark:border-white/[0.04] dark:bg-[#060606]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Image src="/images/ieee_new_logo.png" alt="IEEE" width={36} height={36} className="object-contain" />
              <div>
                <p className="font-display text-sm font-bold tracking-[0.15em] text-gray-900 dark:text-white">IEEE</p>
                <p className="text-[9px] tracking-[0.25em] text-gray-500 dark:text-white/40">SGBIT BELAGAVI</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-white/35">
              Advancing technology for the benefit of humanity — IEEE Student Branch at S.G. Balekundri Institute of Technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-[10px] font-bold tracking-[0.3em] text-gray-900 dark:text-white uppercase">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "About", "Events", "Team", "Contact"].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase()}`} className="text-sm text-gray-500 transition-colors hover:text-ieee-light dark:text-white/40">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* IEEE Resources */}
          <div>
            <h4 className="mb-5 text-[10px] font-bold tracking-[0.3em] text-gray-900 dark:text-white uppercase">IEEE Resources</h4>
            <ul className="space-y-3">
              {[
                { name: "IEEE.org", url: "https://www.ieee.org" },
                { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org" },
                { name: "IEEE Spectrum", url: "https://spectrum.ieee.org" },
                { name: "IEEE Standards", url: "https://standards.ieee.org" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 transition-colors hover:text-ieee-light dark:text-white/40">
                    {link.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-5 text-[10px] font-bold tracking-[0.3em] text-gray-900 dark:text-white uppercase">Follow Us</h4>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/ieee_sgbit/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-ieee-light hover:bg-ieee-light/10 dark:border-white/10">
                <Image src="/images/instagram.svg" alt="Instagram" width={18} height={18} className="opacity-60 hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://www.linkedin.com/company/ieee-sgbit/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-ieee-light hover:bg-ieee-light/10 dark:border-white/10">
                <Image src="/images/linkedin.svg" alt="LinkedIn" width={18} height={18} className="opacity-60 hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-ieee-light hover:bg-ieee-light/10 dark:border-white/10">
                <Image src="/images/facebook.svg" alt="Facebook" width={18} height={18} className="opacity-60 hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-xs text-gray-400 dark:text-white/25">
                S.G. Balekundri Institute of Technology
                <br />
                Belagavi, Karnataka, India
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-200/50 pt-8 dark:border-white/[0.04] md:flex-row">
          <p className="text-[10px] tracking-[0.15em] text-gray-400 dark:text-white/25">
            © {new Date().getFullYear()} IEEE SGBIT Student Branch. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Image src="/images/ieee_new_logo.png" alt="IEEE" width={20} height={20} className="opacity-40" />
              <span className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/20">A unit of IEEE</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src="/images/sgbit_logo-removebg-preview.png" alt="SGBIT" width={20} height={20} className="opacity-40" />
              <span className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/20">SGBIT Belagavi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
