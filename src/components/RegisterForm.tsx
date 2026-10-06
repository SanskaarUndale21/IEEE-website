"use client";

import { useState } from "react";

interface Props {
  event: {
    id: string;
    title: string;
    feeAmount: number;
    paymentInstructions: string;
    spotsLeft: number | null;
  };
}

const MAX_BYTES = 4 * 1024 * 1024;

export default function RegisterForm({ event }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const paid = event.feeAmount > 0;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const file = fd.get("paymentProof");
    if (file instanceof File && file.size > MAX_BYTES) {
      setError("Screenshot must be 4 MB or smaller");
      return;
    }
    if (file instanceof File && file.size === 0) fd.delete("paymentProof");
    fd.set("eventId", event.id);

    setState("loading");
    try {
      const res = await fetch("/api/events/register", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
        <p className="section-label mb-2">Registered</p>
        <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">You are in!</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {paid
            ? "We received your details and payment proof. Our team will verify the payment and confirm your spot."
            : "We received your registration. Our team will confirm your spot soon."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-12 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
      <div>
        <p className="section-label mb-1">Register</p>
        <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {paid ? `Fee: ₹${event.feeAmount}` : "Free event"}
          {event.spotsLeft !== null && ` · ${event.spotsLeft} spot(s) left`}
        </p>
      </div>

      {/* Honeypot: hidden from humans, bots fill it */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label-field">Full Name</label><input required name="name" maxLength={120} className="input-field" /></div>
        <div><label className="label-field">Email</label><input required type="email" name="email" maxLength={200} className="input-field" /></div>
        <div><label className="label-field">Phone</label><input required type="tel" name="phone" maxLength={20} className="input-field" /></div>
        <div><label className="label-field">USN</label><input name="usn" maxLength={30} className="input-field" /></div>
        <div><label className="label-field">College</label><input name="college" maxLength={160} className="input-field" /></div>
        <div><label className="label-field">Branch</label><input name="branch" maxLength={80} className="input-field" /></div>
        <div>
          <label className="label-field">Semester</label>
          <select name="semester" className="input-field" defaultValue="">
            <option value="">Select</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="label-field">Team name (if any)</label><input name="teamName" maxLength={120} className="input-field" /></div>
      </div>

      {paid && (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Payment</p>
          {event.paymentInstructions && (
            <p className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{event.paymentInstructions}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Transaction / UTR ID</label>
              <input required name="transactionId" maxLength={80} className="input-field" />
            </div>
            <div>
              <label className="label-field">Payment screenshot (JPG, PNG, WEBP, max 4 MB)</label>
              <input
                required
                type="file"
                name="paymentProof"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                className="input-field"
              />
              {fileName && <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">{fileName}</p>}
            </div>
          </div>
        </div>
      )}

      <button disabled={state === "loading"} className="btn-primary-sq w-full justify-center py-4 text-sm disabled:opacity-60">
        {state === "loading" ? "Submitting..." : "Submit registration"}
      </button>
      {error && <p className="text-center text-xs text-red-500 dark:text-red-400">{error}</p>}
    </form>
  );
}
