"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RegisterShell from "@/components/ieee-week/RegisterShell";
import { FEE_RULE, PAYMENT, REGISTRABLE } from "@/data/ieeeWeek";
import { IEEE_ID_RE, normalizeIeeeId } from "@/lib/ieeeWeekRules";
import { type RegState, clearDraft, fetchRegState, loadDraft, rememberReg, saveDraft } from "@/lib/ieeeWeekClient";

const MAX_BYTES = 4 * 1024 * 1024;

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <Step3 />
    </Suspense>
  );
}

function Step3() {
  const params = useSearchParams();
  const id = params.get("r") ?? "";
  const resumed = params.get("resumed") === "1";

  const [info, setInfo] = useState<RegState | null | undefined>(undefined);
  const [plan, setPlan] = useState<"ieee" | "non">("ieee");
  const [tx, setTx] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ieeeIds, setIeeeIds] = useState<string[]>(["", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const busy = useRef(false); // blocks a double tap from sending the payment twice

  // The database is the source of truth. This runs on every load, so a refresh or a return
  // from another app always shows the real state.
  const load = useCallback(async () => {
    if (!id) return setInfo(null);
    const st = await fetchRegState(id);
    setInfo(st);
    if (st) rememberReg(st.slug, st.id);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Restore what was typed before the page was reloaded or the app was switched.
  useEffect(() => {
    if (!id) return;
    const d = loadDraft(id);
    if (d) {
      setPlan(d.plan);
      setTx(d.tx);
      setConfirm(d.confirm);
      setIeeeIds(d.ieeeIds.length ? d.ieeeIds : ["", "", "", "", ""]);
    }
  }, [id]);
  useEffect(() => {
    if (id && (tx || confirm || ieeeIds.some(Boolean) || plan !== "ieee")) saveDraft(id, { plan, tx, confirm, ieeeIds });
  }, [id, plan, tx, confirm, ieeeIds]);

  // Coming back from the payment app: check the status again when the tab becomes visible.
  useEffect(() => {
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, [load]);

  const event = info ? REGISTRABLE.find((e) => e.slug === info.slug) : undefined;
  const fee = event?.fee ? (plan === "ieee" ? event.fee.ieee : event.fee.nonIeee) : 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current || !info?.canPay) return;
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
    if (plan === "ieee" && event) {
      const given = ieeeIds.slice(0, event.teamCount).map(normalizeIeeeId);
      if (!given[0]) return setError("Enter the IEEE ID of member 1. It is needed to verify your IEEE membership.");
      if (given.some((v) => v && !IEEE_ID_RE.test(v))) return setError("An IEEE ID must be digits only, 6 to 12 digits.");
      if (new Set(given.filter(Boolean)).size !== given.filter(Boolean).length) return setError("Each member needs a different IEEE ID.");
      given.forEach((v, i) => body.set(`ieeeId${i + 1}`, v));
    }
    body.set("paymentProof", proof);

    busy.current = true;
    setSending(true);
    try {
      const res = await fetch("/api/ieee-week/pay", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not save your payment. Try again.");
        // The state may have moved on (paid in another tab, or checked by an admin). Show the real one.
        if (res.status === 409) await load();
        busy.current = false;
        setSending(false);
        return;
      }
      clearDraft(id);
      await load();
      busy.current = false;
      setSending(false);
    } catch {
      setError("No connection. Check your internet and try again.");
      busy.current = false;
      setSending(false);
    }
  }

  async function recheck() {
    setChecking(true);
    await load();
    setChecking(false);
  }

  const status = info?.paymentStatus;

  return (
    <RegisterShell step={3} title={status === "verified" ? "You are in" : status === "submitted" ? "Payment received" : "Pay and confirm"}>
      {info === undefined && <p className="text-lg">Loading your registration.</p>}

      {info === null && (
        <div className="dd-slab p-6" role="alert">
          <p className="text-lg">We could not find this registration. Check the link, or start again from the event page.</p>
          <Link href="/ieee-week#details" className="dd-btn dd-display mt-5 inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-5 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]">
            Back to events
          </Link>
        </div>
      )}

      {info && event && (
        <div className="space-y-8">
          {resumed && info.canPay && (
            <p className="border border-[var(--dd-glow)]/50 bg-[var(--dd-glow)]/10 p-4 text-base" role="status">
              Welcome back. Your team is already saved, so you can pay now. You do not need to register again.
            </p>
          )}

          <p className="text-lg">
            {info.teamName}, {event.title}, {event.day}-10-26, {event.time}, {event.venue}
          </p>

          {status === "verified" && (
            <div className="dd-slab border-[var(--dd-glow)]/60 p-8" role="status">
              <h2 className="dd-display text-4xl text-[var(--dd-glow)]">Registration confirmed</h2>
              <p className="mt-3 text-lg leading-relaxed">
                Your payment is verified. Be at {event.venue} at {event.time} on {event.day}-10-26. Keep this page, you can open it again from the same link.
              </p>
              {info.amount != null && <p className="mt-2 text-base text-[var(--dd-iron)]/80">Paid: ₹{info.amount}</p>}
            </div>
          )}

          {status === "submitted" && (
            <div className="dd-slab p-8" role="status">
              <h2 className="dd-display text-4xl text-[var(--dd-gold)]">Waiting to be verified</h2>
              <p className="mt-3 text-lg leading-relaxed">
                We have your payment details{info.amount != null ? ` (₹${info.amount})` : ""}. An organiser checks them against the bank record, then your registration is confirmed. You do not need to do anything else.
              </p>
              <button onClick={recheck} disabled={checking} className="dd-btn dd-display mt-5 inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-6 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)] disabled:opacity-60">
                {checking ? "Checking" : "Check status again"}
              </button>
            </div>
          )}

          {status === "rejected" && (
            <div className="border border-red-400/60 bg-red-500/10 p-5 text-lg" role="alert">
              <p className="font-semibold text-red-200">Your payment was not accepted.</p>
              {info.reason && <p className="mt-1">Reason: {info.reason}</p>}
              <p className="mt-1">Check the details below and send the payment again. Your team is still saved.</p>
            </div>
          )}

          {info.canPay && (
            <form onSubmit={submit} className="space-y-10">
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

              {plan === "ieee" && (
                <fieldset className="space-y-4">
                  <legend className="dd-display mb-1 text-3xl text-[var(--dd-gold)]">IEEE membership</legend>
                  <p className="max-w-[60ch] text-base leading-relaxed text-[var(--dd-iron)]/85">
                    We check these numbers to confirm the IEEE price. Member 1 is required. Add the others if they are IEEE members too.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: event.teamCount }, (_, i) => (
                      <div key={i}>
                        <label htmlFor={`ieee-${i}`} className="dd-label">
                          {i === 0 ? "Member 1 IEEE ID (required)" : `Member ${i + 1} IEEE ID (optional)`}
                        </label>
                        <input
                          id={`ieee-${i}`}
                          value={ieeeIds[i]}
                          onChange={(e) => setIeeeIds((ids) => ids.map((v, j) => (j === i ? e.target.value : v)))}
                          required={i === 0}
                          inputMode="numeric"
                          maxLength={20}
                          autoComplete="off"
                          className="dd-field"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

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
                <p className="mt-4 text-base text-[var(--dd-iron)]/75">
                  You can leave this page to pay in your payment app and come back. Your team stays saved and what you typed here is kept.
                </p>
              </div>

              <fieldset disabled={sending} className="space-y-8">
                <legend className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">After you pay</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tx" className="dd-label">
                      Transaction ID (UTR)
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
                  {sending ? "Sending" : status === "rejected" ? "Send payment again" : "Submit payment"}
                </button>
              </fieldset>
            </form>
          )}

          {!info.canPay && (
            <Link href="/ieee-week#details" className="dd-btn dd-display inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-6 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]">
              Back to IEEE Week
            </Link>
          )}
        </div>
      )}
    </RegisterShell>
  );
}
