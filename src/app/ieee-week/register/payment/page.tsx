"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RegisterShell from "@/components/ieee-week/RegisterShell";
import { FEE_RULE, PAYMENT, REGISTRABLE } from "@/data/ieeeWeek";

const MAX_BYTES = 4 * 1024 * 1024;

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <Step3 />
    </Suspense>
  );
}

function Step3() {
  const id = useSearchParams().get("r") ?? "";
  const [info, setInfo] = useState<{ slug: string; teamName: string; paid: boolean } | null | undefined>(undefined);
  const [plan, setPlan] = useState<"ieee" | "non">("ieee");
  const [tx, setTx] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return setInfo(null);
    fetch(`/api/ieee-week/register?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setInfo(d?.success ? d : null))
      .catch(() => setInfo(null));
  }, [id]);

  const event = info ? REGISTRABLE.find((e) => e.slug === info.slug) : undefined;
  const fee = event?.fee ? (plan === "ieee" ? event.fee.ieee : event.fee.nonIeee) : 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const proof = new FormData(e.currentTarget).get("paymentProof");
    if (!(proof instanceof File) || proof.size === 0) return setError("Upload your payment screenshot.");
    if (proof.size > MAX_BYTES) return setError("The screenshot is larger than 4 MB. Upload a smaller image.");
    if (tx.trim().toLowerCase() !== confirm.trim().toLowerCase()) return setError("The two transaction ids do not match.");

    const body = new FormData();
    body.set("id", id);
    body.set("plan", plan);
    body.set("transactionId", tx.trim());
    body.set("confirmId", confirm.trim());
    body.set("website", "");
    body.set("paymentProof", proof);

    setState("sending");
    try {
      const res = await fetch("/api/ieee-week/pay", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not save your payment. Try again.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("No connection. Check your internet and try again.");
      setState("idle");
    }
  }

  return (
    <RegisterShell step={3} title="Pay and confirm">
      {info === undefined && <p className="text-lg">Loading your registration.</p>}

      {info === null && (
        <div className="dd-slab p-6" role="alert">
          <p className="text-lg">We could not find this registration. Start again from the event page.</p>
          <Link href="/ieee-week#details" className="dd-btn dd-display mt-5 inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-5 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]">
            Back to events
          </Link>
        </div>
      )}

      {info && event && (info.paid || state === "done") && (
        <div className="dd-slab p-8" role="status">
          <h2 className="dd-display text-4xl text-[var(--dd-glow)]">{state === "done" ? "Payment submitted" : "Already paid"}</h2>
          <p className="mt-3 text-lg leading-relaxed">
            {info.teamName} is registered for {event.title}. We check your payment, then confirm. Be at {event.venue} at {event.time} on {event.day}-10-26.
          </p>
          <Link href="/ieee-week#details" className="dd-btn dd-display mt-6 inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-6 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]">
            Back to IEEE Week
          </Link>
        </div>
      )}

      {info && event && !info.paid && state !== "done" && (
        <form onSubmit={submit} className="space-y-10">
          <p className="text-lg">
            {info.teamName}, {event.title}
          </p>

          <fieldset>
            <legend className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">Fee</legend>
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
                    plan === v ? "border-[var(--dd-glow)] bg-[var(--dd-glow)]/10" : "border-[var(--dd-iron)]/25"
                  }`}
                >
                  <input type="radio" name="plan" checked={plan === v} onChange={() => setPlan(v)} className="h-5 w-5 accent-[#46f0a0]" />
                  <span className="text-lg">
                    {label}: ₹{price}
                    {event.fee?.note ? ` ${event.fee.note}` : ""}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <p className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">Scan and pay</p>
            <p className="mb-5 text-xl">
              Pay <strong className="text-[var(--dd-glow)]">₹{fee}</strong>
              {event.fee?.note ? ` ${event.fee.note}` : ""}
              {PAYMENT.payee ? ` to ${PAYMENT.payee}` : ""}.
            </p>
            {PAYMENT.qr ? (
              <div className="relative mx-auto aspect-square w-full max-w-[18rem] bg-white p-3">
                <Image src={PAYMENT.qr} alt={PAYMENT.qrAlt} fill sizes="288px" className="object-contain p-3" />
              </div>
            ) : (
              <div className="mx-auto flex aspect-square w-full max-w-[18rem] items-center justify-center border border-dashed border-[var(--dd-iron)]/40 p-6 text-center text-lg text-[var(--dd-iron)]/70">
                The payment QR code will appear here.
              </div>
            )}
          </div>

          <fieldset disabled={state === "sending"} className="space-y-8">
            <legend className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">After you pay</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tx" className="dd-label">
                  Transaction ID
                </label>
                <input id="tx" value={tx} onChange={(e) => setTx(e.target.value)} required maxLength={80} autoComplete="off" className="dd-field" />
              </div>
              <div>
                <label htmlFor="tx2" className="dd-label">
                  Enter the transaction ID again
                </label>
                <input id="tx2" value={confirm} onChange={(e) => setConfirm(e.target.value)} required maxLength={80} autoComplete="off" className="dd-field" />
              </div>
            </div>
            <div>
              <label htmlFor="paymentProof" className="dd-label">
                Upload the payment screenshot (image, up to 4 MB)
              </label>
              <input id="paymentProof" name="paymentProof" type="file" accept="image/jpeg,image/png,image/webp" required className="dd-field pt-3" />
            </div>

            {error && (
              <p role="alert" className="border border-red-400/60 bg-red-500/10 p-4 text-lg text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="dd-btn dd-display inline-flex min-h-14 w-full items-center justify-center bg-[var(--dd-glow)] px-8 text-2xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {state === "sending" ? "Sending" : "Submit payment"}
            </button>
          </fieldset>
        </form>
      )}
    </RegisterShell>
  );
}
