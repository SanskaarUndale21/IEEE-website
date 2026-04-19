"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SOCIAL, IMAGES, QUERY_TOPICS } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [form, setForm] = useState({ email: "", phone: "", topic: "" });
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".contact-card", {
        y: 50, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-card", start: "top 88%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setFormState(res.ok ? "success" : "error");
    } catch (_) {
      setFormState("error");
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="noise relative overflow-hidden border-t border-gray-200/50 px-6 py-24 dark:border-white/[0.04] md:py-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-ieee-blue/[0.04] blur-[150px] dark:bg-ieee-blue/[0.06]" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-ieee-light/[0.03] blur-[120px]" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-14 text-center"
        >
          <p className="section-label mb-4">Stay Connected</p>
          <h2 className="font-display text-3xl font-bold tracking-[0.25em] text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            FOLLOW THE INNOVATION
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 dark:text-white/40">
            Get event updates, behind-the-scenes content, and recruitment announcements from our channels.
          </p>
        </motion.div>

        {/* Social cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card glass-card group flex items-start gap-5 rounded-2xl p-8"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 transition-transform duration-500 group-hover:scale-110">
              <Image src={IMAGES.instagram} alt="Instagram" width={28} height={28} className="opacity-70 transition-opacity group-hover:opacity-100" />
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-white/35">Instagram</p>
              <p className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">{SOCIAL.instagramHandle}</p>
              <p className="text-sm text-gray-500 dark:text-white/40">Event highlights, workshop moments, and community stories.</p>
            </div>
            <svg className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-gray-300 transition-transform duration-300 group-hover:translate-x-1 dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>

          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card glass-card group flex items-start gap-5 rounded-2xl p-8"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 transition-transform duration-500 group-hover:scale-110">
              <Image src={IMAGES.linkedin} alt="LinkedIn" width={28} height={28} className="opacity-70 transition-opacity group-hover:opacity-100" />
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-white/35">LinkedIn</p>
              <p className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">{SOCIAL.linkedinHandle}</p>
              <p className="text-sm text-gray-500 dark:text-white/40">Official announcements, collaborations, and professional updates.</p>
            </div>
            <svg className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-gray-300 transition-transform duration-300 group-hover:translate-x-1 dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>

        {/* Query form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-10"
        >
          <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
            <div className="mb-6 text-center">
              <p className="section-label mb-1">Queries</p>
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Have a Question?</h3>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">Leave your details and we&apos;ll get back to you shortly.</p>
            </div>

            <AnimatePresence mode="wait">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-6 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <p className="font-display text-base font-bold text-gray-900 dark:text-white">Got it! We&apos;ll be in touch.</p>
                  <button
                    onClick={() => { setFormState("idle"); setForm({ email: "", phone: "", topic: "" }); }}
                    className="text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--ieee-blue)]"
                  >
                    Submit another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label-field">Your Email</label>
                      <input
                        required type="email" placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field">Phone Number</label>
                      <input
                        required type="tel" placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-field">What is your query about?</label>
                    <select
                      required
                      value={form.topic}
                      onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select a topic</option>
                      {QUERY_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={formState === "loading"}
                    className="btn-primary-sq w-full justify-center py-3 text-sm disabled:opacity-60"
                  >
                    {formState === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Sending...
                      </span>
                    ) : "Send Query →"}
                  </button>

                  {formState === "error" && (
                    <p className="text-center text-xs text-red-400">Something went wrong. Please try again.</p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
