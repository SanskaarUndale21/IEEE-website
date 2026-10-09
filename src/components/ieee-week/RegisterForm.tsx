"use client";

import { useEffect, useMemo, useState } from "react";
import { FEE_RULE, REGISTRABLE } from "@/data/ieeeWeek";
import { SELECT_EVENT } from "./registerBus";

type OpenEvent = { id: string; feeAmount: number; paymentInstructions: string };

const MAX_PROOF_BYTES = 4 * 1024 * 1024;

export default function RegisterForm() {
  const [open, setOpen] = useState<Record<string, OpenEvent> | null>(null);
  const [slug, setSlug] = useState(REGISTRABLE[0].slug);
  const [membership, setMembership] = useState<"ieee" | "non">("ieee");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const event = useMemo(() => REGISTRABLE.find((e) => e.slug === slug) ?? REGISTRABLE[0], [slug]);
  const live = open?.[event.slug];
  const fee = event.fee ? (membership === "ieee" ? event.fee.ieee : event.fee.nonIeee) : 0;

  useEffect(() => {
    let alive = true;
    fetch("/api/ieee-week/events")
      .then((r) => r.json())
      .then((d: { events?: (OpenEvent & { slug: string })[] }) => {
        if (!alive) return;
        const map: Record<string, OpenEvent> = {};
        for (const e of d.events ?? []) map[e.slug] = e;
        setOpen(map);
      })
      .catch(() => alive && setOpen({}));
    const onSelect = (e: Event) => {
      const s = (e as CustomEvent<string>).detail;
      if (REGISTRABLE.some((x) => x.slug === s)) setSlug(s);
    };
    window.addEventListener(SELECT_EVENT, onSelect);
    return () => {
      alive = false;
      window.removeEventListener(SELECT_EVENT, onSelect);
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!live) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const proof = f.get("paymentProof");
    if (!(proof instanceof File) || proof.size === 0) return setError("Upload your payment screenshot.");
    if (proof.size > MAX_PROOF_BYTES) return setError("The screenshot is larger than 4 MB. Upload a smaller image.");

    const others: string[] = [];
    for (let i = 2; i <= event.teamCount; i++) {
      const n = get(`member${i}Name`);
      const u = get(`member${i}Usn`);
      if (!n) return setError(`Enter the name of member ${i}.`);
      others.push(`Member ${i}: ${n}${u ? ` (${u})` : ""}`);
    }
    const num = get("ieeeNumber");
    const membershipNote =
      membership === "ieee"
        ? `Team has at least one IEEE member${num ? ` (membership no. ${num})` : ""}, IEEE price Rs ${fee}`
        : `No IEEE member in the team, non-IEEE price Rs ${fee}`;

    const body = new FormData();
    body.set("eventId", live.id);
    for (const k of ["name", "email", "phone", "usn", "college", "branch", "semester", "teamName", "transactionId"]) body.set(k, get(k));
    body.set("members", others.join("; "));
    body.set("membership", membershipNote);
    body.set("website", get("website"));
    body.set("paymentProof", proof);

    setState("sending");
    try {
      const res = await fetch("/api/events/register", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not save your registration. Try again.");
        setState("idle");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setError("No connection. Check your internet and try again.");
      setState("idle");
    }
  }

  return (
    <section id="register" className="relative scroll-mt-20 px-5 pb-28 md:px-10 md:pb-40" aria-labelledby="register-title">
      <div className="mx-auto max-w-3xl">
        <h2 id="register-title" className="dd-display mb-4 text-5xl text-[var(--dd-iron)] sm:text-7xl">
          Register
        </h2>
        <p className="mb-10 max-w-[56ch] text-lg">
          Pick an event, fill in your team and pay the fee. We confirm by email once your payment is checked. One registration per team.
        </p>

        {state === "done" ? (
          <div className="dd-slab p-8" role="status">
            <h3 className="dd-display text-4xl text-[var(--dd-glow)]">You are registered</h3>
            <p className="mt-3 text-lg leading-relaxed">
              We have your registration for {event.title}. It stays pending until we check your payment, then you get an email.
            </p>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="dd-btn dd-display mt-6 inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-6 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]"
            >
              Register for another event
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-10" noValidate={false}>
            {/* 1. event */}
            <fieldset>
              <legend className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">1. Event</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {REGISTRABLE.map((e) => (
                  <label
                    key={e.slug}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 border px-4 py-3 transition-colors ${
                      e.slug === slug ? "border-[var(--dd-glow)] bg-[var(--dd-glow)]/10" : "border-[var(--dd-iron)]/25 hover:border-[var(--dd-iron)]/60"
                    }`}
                  >
                    <input type="radio" name="event" value={e.slug} checked={e.slug === slug} onChange={() => setSlug(e.slug)} className="h-5 w-5 accent-[#46f0a0]" />
                    <span>
                      <span className="block text-lg leading-tight">{e.title}</span>
                      <span className="block text-sm text-[var(--dd-iron)]/65">
                        {e.day}-10-26, {e.category}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-base text-[var(--dd-iron)]/80">
                {event.venue}, {event.time}. Team of {event.teamLabel.replace(/ (members|participants)/, "")}
                {event.roles ? ` (${event.roles})` : ""}.
              </p>
            </fieldset>

            {open !== null && !live && (
              <p className="border border-[var(--dd-gold)]/50 bg-[var(--dd-gold)]/10 p-4 text-lg" role="status">
                Registration for {event.title} opens soon. The form is ready, check back here.
              </p>
            )}

            <fieldset disabled={!live || state === "sending"} className="space-y-10 disabled:opacity-60">
              {/* 2. membership */}
              <div>
                <p className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">2. Team fee</p>
                <p className="mb-4 border-l-2 border-[var(--dd-glow)] pl-4 text-base leading-relaxed">{FEE_RULE}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["ieee", "At least one member is IEEE", event.fee?.ieee],
                      ["non", "Every member is non-IEEE", event.fee?.nonIeee],
                    ] as const
                  ).map(([v, label, price]) => (
                    <label
                      key={v}
                      className={`flex min-h-14 cursor-pointer items-center gap-3 border px-4 py-3 ${
                        membership === v ? "border-[var(--dd-glow)] bg-[var(--dd-glow)]/10" : "border-[var(--dd-iron)]/25"
                      }`}
                    >
                      <input type="radio" name="membership" checked={membership === v} onChange={() => setMembership(v)} className="h-5 w-5 accent-[#46f0a0]" />
                      <span className="text-lg">
                        {label}: ₹{price}
                        {event.fee?.note ? ` ${event.fee.note}` : ""}
                      </span>
                    </label>
                  ))}
                </div>
                {membership === "ieee" && (
                  <div className="mt-4">
                    <label htmlFor="ieeeNumber" className="dd-label">
                      IEEE membership number of the member(s)
                    </label>
                    <input id="ieeeNumber" name="ieeeNumber" inputMode="numeric" maxLength={20} className="dd-field" />
                  </div>
                )}
              </div>

              {/* 3. team */}
              <div>
                <p className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">3. Team</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Team name" name="teamName" required max={120} className="sm:col-span-2" />
                  <Field label="Your full name" name="name" required max={120} autoComplete="name" />
                  <Field label="USN" name="usn" required max={30} autoCapitalize="characters" />
                  <Field label="Email" name="email" type="email" required max={200} autoComplete="email" />
                  <Field label="Phone number" name="phone" type="tel" required max={20} autoComplete="tel" inputMode="tel" />
                  <Field label="College" name="college" required max={160} />
                  <Field label="Branch" name="branch" required max={80} />
                  <div>
                    <label htmlFor="semester" className="dd-label">
                      Semester
                    </label>
                    <select id="semester" name="semester" required defaultValue="" className="dd-field">
                      <option value="" disabled>
                        Select
                      </option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  {Array.from({ length: event.teamCount - 1 }, (_, i) => i + 2).map((n) => (
                    <div key={`${event.slug}-${n}`} className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                      <Field label={`Member ${n} name`} name={`member${n}Name`} required max={80} />
                      <Field label={`Member ${n} USN`} name={`member${n}Usn`} max={30} autoCapitalize="characters" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. payment */}
              <div>
                <p className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">4. Payment</p>
                <p className="mb-4 text-xl">
                  Pay <strong className="text-[var(--dd-glow)]">₹{fee}</strong>
                  {event.fee?.note ? ` ${event.fee.note}` : ""}.
                </p>
                <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--dd-iron)]/85">
                  {live?.paymentInstructions || "Payment details appear here when registration opens."}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Transaction / UTR id" name="transactionId" required max={80} />
                  <div>
                    <label htmlFor="paymentProof" className="dd-label">
                      Payment screenshot (image, up to 4 MB)
                    </label>
                    <input id="paymentProof" name="paymentProof" type="file" accept="image/jpeg,image/png,image/webp" required className="dd-field pt-3" />
                  </div>
                </div>
              </div>

              {/* honeypot */}
              <div className="hidden" aria-hidden>
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {error && (
                <p role="alert" className="border border-red-400/60 bg-red-500/10 p-4 text-lg text-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!live || state === "sending"}
                className="dd-btn dd-display inline-flex min-h-14 w-full items-center justify-center bg-[var(--dd-glow)] px-8 text-2xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {state === "sending" ? "Sending" : "Submit registration"}
              </button>
            </fieldset>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  max,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  max: number;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type" | "required" | "maxLength">) {
  return (
    <div className={className}>
      <label htmlFor={name} className="dd-label">
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} maxLength={max} className="dd-field" {...rest} />
    </div>
  );
}
