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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
        <div className="glass-card max-w-md w-full p-12 text-center rounded-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className="h-16 w-16 rounded-full bg-[var(--ieee-blue)]/10 flex items-center justify-center border border-[var(--ieee-blue)]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </motion.div>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">Application Submitted</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
            Coordinators will soon contact you for further registration process. Welcome to the IEEE SGBIT community!
          </p>
          <Link href="/" className="btn-primary-sq w-full justify-center">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[var(--bg)] pt-28 pb-20 px-5 md:px-8">
      <div className="mx-auto max-w-2xl relative z-10">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase mb-10 hover:text-[var(--ieee-blue)] dark:hover:text-[var(--ieee-light)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="relative h-12 w-12 mx-auto mb-5">
            <Image src="/images/ieee_new_logo.png" alt="IEEE" fill className="object-contain" />
          </div>
          <p className="section-label mb-3">Membership</p>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3 md:text-4xl">
            Join IEEE SGBIT
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto">
            Become part of the world&apos;s largest technical professional organization.
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="label-field">Full Name</label>
              <input required type="text" placeholder="John Doe" className="input-field" />
            </div>

            <div>
              <label className="label-field">Email Address</label>
              <input required type="email" placeholder="john@example.com" className="input-field" />
            </div>

            <div>
              <label className="label-field">Semester</label>
              <select required className="input-field">
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>{s}th SEM</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Branch</label>
              <input required type="text" placeholder="CSE / ECE / MECH..." className="input-field" />
            </div>

            <div>
              <label className="label-field">IEEE Account Password</label>
              <input required type="password" placeholder="••••••••" className="input-field" />
            </div>

            <div>
              <label className="label-field">Date of Birth</label>
              <input required type="date" className="input-field" />
            </div>

            <div className="md:col-span-2">
              <label className="label-field">Contact Number</label>
              <input required type="tel" placeholder="+91 00000 00000" className="input-field" />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-[var(--border)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4">Security Question</p>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="label-field">Question</label>
                  <input required type="text" placeholder="e.g. Your first school name" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Answer</label>
                  <input required type="text" placeholder="Your Answer" className="input-field" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                disabled={loading}
                type="submit"
                className="btn-primary-sq w-full justify-center py-4 text-sm"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="load"
                      className="flex items-center gap-3"
                    >
                      <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing...
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

        {/* Info */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
          {[
            { label: "Members", value: "200+" },
            { label: "Events Annually", value: "20+" },
            { label: "Years Active", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
              <p className="font-display text-2xl font-bold text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
