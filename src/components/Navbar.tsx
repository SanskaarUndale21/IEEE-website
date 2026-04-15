"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Events", href: "#events" },
  { name: "Team", href: "#team" },
  { name: "Contact", href: "#contact" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-ieee-light hover:bg-ieee-light/10 dark:border-white/10 dark:hover:border-ieee-light"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      // Detect active section
      const sections = ["home", "about", "events", "team", "contact"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass py-3 shadow-lg shadow-black/5 dark:shadow-black/20" : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="#home" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 transition-transform duration-300 group-hover:scale-110">
              <Image src="/images/ieee_new_logo.png" alt="IEEE" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold tracking-[0.15em] text-gray-900 dark:text-white">IEEE</span>
              <span className="text-[9px] tracking-[0.25em] text-gray-500 dark:text-white/50">SGBIT</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`group relative text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
                  activeSection === link.href.slice(1)
                    ? "text-ieee-light"
                    : "text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white"
                }`}
              >
                {link.name}
                <motion.span
                  className="absolute -bottom-1 left-0 h-[1.5px] bg-ieee-light"
                  initial={false}
                  animate={{ width: activeSection === link.href.slice(1) ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
            
            <div className="flex items-center gap-4 ml-4">
              <Link href="/events/upcoming" className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-ieee-light transition-colors">
                Events
              </Link>
              <Link href="/join" className="rounded-full bg-ieee-light px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-ieee-blue hover:shadow-[0_0_20px_rgba(0,163,224,0.3)]">
                Join IEEE
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile hamburger + theme */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5" aria-label="Menu">
              <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block h-[1.5px] w-6 bg-gray-900 dark:bg-white" />
              <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block h-[1.5px] w-6 bg-gray-900 dark:bg-white" />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block h-[1.5px] w-6 bg-gray-900 dark:bg-white" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-white/95 backdrop-blur-2xl dark:bg-black/95 md:hidden"
          >
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)} className="font-display text-3xl font-light tracking-[0.35em] text-gray-900 dark:text-white/90 transition-colors hover:text-ieee-light">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
