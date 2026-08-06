"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MEMBERSHIP_BENEFITS, STATS, IMAGES, SITE } from "@/constants";

const benefitStats = [
  { value: STATS.ieeeGlobalMembers, label: "IEEE Members" },
  { value: STATS.members, label: "SGBIT Members" },
  { value: STATS.eventsAnnually, label: "Events / Year" },
];

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", semester: "", branch: "",
    password: "", dob: "", contact: "",
    securityQuestion: "", securityAnswer: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name, email: formData.email, semester: formData.semester,
          branch: formData.branch, dob: formData.dob, contact: formData.contact,
          securityQuestion: formData.securityQuestion, securityAnswer: formData.securityAnswer,
        }),
      });
    } catch (_) {}
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] p-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-ieee-blue/10 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-ieee-light/8 blur-[100px]" />
        </div>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center shadow-[var(--shadow-lg)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-[var(--ieee-blue)]/15 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--ieee-blue)]/10 border border-[var(--ieee-blue)]/25">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="section-label mb-2">Welcome Aboard</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">Application Submitted!</h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
              Our coordinators will reach out to you soon for the next steps. Welcome to the IEEE SGBIT community!
            </p>
            <Link href="/" className="btn-primary-sq w-full justify-center py-3">
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[var(--bg)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-ieee-blue/[0.04] blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-ieee-light/[0.04] blur-[140px]" />
      </div>

      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ── LEFT: Form ────────────────────────────────────── */}
        <div className="flex w-full flex-col justify-center px-6 pb-16 pt-28 md:px-10 md:pt-28 lg:max-w-[52%] lg:px-14 lg:pt-32 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg"
          >
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image src={IMAGES.logo} alt="IEEE" fill className="object-contain" />
              </div>
              <div>
                <p className="section-label">Membership Application</p>
                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                  Join IEEE {SITE.branchCode}
                </h1>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Full Name</label>
                  <input
                    required name="name" type="text" placeholder="John Doe"
                    value={formData.name} onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Email Address</label>
                  <input
                    required name="email" type="email" placeholder="john@example.com"
                    value={formData.email} onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Semester</label>
                  <select required name="semester" value={formData.semester} onChange={handleChange} className="input-field">
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>{s}{s === 1 ? "st" : s === 2 ? "nd" : s === 3 ? "rd" : "th"} SEM</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Branch</label>
                  <input
                    required name="branch" type="text" placeholder="CSE / ECE / MECH..."
                    value={formData.branch} onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">IEEE Account Password</label>
                  <input
                    required name="password" type="password" placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Date of Birth</label>
                  <input
                    required name="dob" type="date"
                    value={formData.dob} onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Contact Number</label>
                  <input
                    required name="contact" type="tel" placeholder="+91 00000 00000"
                    value={formData.contact} onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Security Question</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label-field">Question</label>
                    <input
                      required name="securityQuestion" type="text" placeholder="e.g. Your first school name"
                      value={formData.securityQuestion} onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-field">Answer</label>
                    <input
                      required name="securityAnswer" type="text" placeholder="Your answer"
                      value={formData.securityAnswer} onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="btn-primary-sq w-full justify-center py-4 text-sm disabled:opacity-60"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Processing...
                    </motion.div>
                  ) : (
                    <motion.span key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Submit Membership Application →
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>
        </div>

        {/* ── RIGHT: Benefits ────────────────────────────────── */}
        <div className="relative flex w-full flex-col justify-center overflow-hidden border-t border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-16 dark:border-white/5 dark:bg-[#0D1520] md:px-10 lg:border-l lg:border-t-0 lg:min-h-screen lg:px-12 xl:px-16">

          {/* Background orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-ieee-blue/10 blur-[100px]" />
            <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-ieee-light/8 blur-[90px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-500/5 blur-[120px]" />
            {/* Grid pattern */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.025] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-xl">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-8"
            >
              <p className="section-label mb-2">Why Join?</p>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                Student Benefits<br />
                <span className="gradient-text">Unlocked with IEEE</span>
              </h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                IEEE membership opens doors to a world of technical resources, career opportunities, and a global community.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 grid grid-cols-3 gap-3"
            >
              {benefitStats.map((stat, i) => (
                <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center dark:border-white/8 dark:bg-white/[0.04]">
                  <p className="font-display text-xl font-black text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">{stat.value}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Benefits grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {MEMBERSHIP_BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-card)",
                    border: `1px solid ${benefit.border}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${benefit.accent}22`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${benefit.accent}66`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                    (e.currentTarget as HTMLElement).style.borderColor = benefit.border;
                  }}
                >
                  {/* Glow bg */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse at top left, ${benefit.bg}, transparent 70%)` }}
                  />

                  <div className="relative z-10 flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: benefit.bg, border: `1px solid ${benefit.border}` }}
                    >
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="mb-0.5 text-xs font-bold text-gray-900 dark:text-white">{benefit.title}</h3>
                      <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">{benefit.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-center text-[11px] text-[var(--text-muted)]"
            >
              Trusted by engineers in 160+ countries · Est. {SITE.yearFounded}
            </motion.p>
          </div>
        </div>

      </div>
    </main>
  );
}
