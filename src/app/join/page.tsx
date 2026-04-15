"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="noise relative min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-12 text-center rounded-[2.5rem] shadow-2xl relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className="h-20 w-20 rounded-full bg-ieee-light/10 flex items-center justify-center border border-ieee-light/30">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ieee-light">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </motion.div>
          <h2 className="font-display text-4xl font-black text-white mb-4 tracking-tight">Success!</h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Coordinators will soon contact you for further registration process. Welcome to the community!
          </p>
          <Link href="/" className="btn-primary w-full">
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="noise relative min-h-screen pt-32 pb-20 px-6 overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="pointer-events-none absolute -left-20 top-0 h-[600px] w-[600px] bg-ieee-blue/5 blur-[180px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[600px] w-[600px] bg-ieee-light/5 blur-[180px]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase mb-12 hover:text-ieee-light transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </Link>

        <header className="mb-16 text-center">
          <div className="relative h-16 w-16 mx-auto mb-6">
            <Image src="/images/ieee_new_logo.png" alt="IEEE" fill className="object-contain" />
          </div>
          <h1 className="font-display text-5xl font-black text-white mb-4 tracking-tight uppercase">Join IEEE SGBIT</h1>
          <p className="text-white/40 text-sm tracking-[0.1em]">Become a member of the world's largest technical professional organization.</p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] p-10 md:p-14 border border-white/5 shadow-2xl shadow-black/40"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Full Name</label>
              <input required type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Email Address</label>
              <input required type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Semester</label>
              <select required className="w-auto bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all appearance-none">
                <option value="" className="bg-dark text-white">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-dark text-white">{s}th SEM</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Branch</label>
              <input required type="text" placeholder="CSE / ECE / MECH..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">IEEE Account Password</label>
              <input required type="password" placeholder="********" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Date of Birth</label>
              <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all [color-scheme:dark]" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Contact Number</label>
              <input required type="tel" placeholder="+91 00000 00000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 pt-8 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Security Question</label>
                <input required type="text" placeholder="e.g. Your first school name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-2">Security Answer</label>
                <input required type="text" placeholder="Your Answer" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-ieee-light/50 focus:bg-white/[0.08] transition-all" />
              </div>
            </div>

            <div className="md:col-span-2 pt-10">
              <button disabled={loading} type="submit" className="btn-primary w-full py-5 text-base relative overflow-hidden group">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="load" className="flex items-center gap-3">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </motion.div>
                  ) : (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="submit">
                      Submit Membership Application
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
