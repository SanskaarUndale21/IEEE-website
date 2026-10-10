"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RegisterShell from "@/components/ieee-week/RegisterShell";
import { REGISTRABLE } from "@/data/ieeeWeek";

export default function WhatsAppPage() {
  return (
    <Suspense fallback={null}>
      <Step2 />
    </Suspense>
  );
}

function Step2() {
  const id = useSearchParams().get("r") ?? "";
  const [info, setInfo] = useState<{ slug: string; teamName: string; paid: boolean; canPay: boolean; paymentStatus: string } | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return setInfo(null);
    fetch(`/api/ieee-week/register?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setInfo(d?.success ? d : null))
      .catch(() => setInfo(null));
  }, [id]);

  const event = info ? REGISTRABLE.find((e) => e.slug === info.slug) : undefined;

  return (
    <RegisterShell step={2} title="Join the WhatsApp group">
      {info === undefined && <p className="text-lg">Loading your registration.</p>}

      {info === null && (
        <div className="dd-slab p-6" role="alert">
          <p className="text-lg">We could not find this registration. Start again from the event page.</p>
          <Link href="/ieee-week#details" className="dd-btn dd-display mt-5 inline-flex min-h-12 items-center border border-[var(--dd-iron)]/40 px-5 text-xl hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]">
            Back to events
          </Link>
        </div>
      )}

      {info && event && (
        <div className="space-y-8">
          <div className="dd-slab p-6 sm:p-8">
            <p className="text-sm text-[var(--dd-gold)]">Team saved</p>
            <h2 className="dd-display mt-1 text-4xl leading-tight text-[var(--dd-glow)]">{info.teamName}</h2>
            <p className="mt-2 text-lg">
              {event.title}, {event.day}-10-26, {event.time}, {event.venue}
            </p>
          </div>

          <div>
            <p className="dd-display mb-3 text-3xl text-[var(--dd-gold)]">WhatsApp group for {event.title}</p>
            {event.whatsapp ? (
              <>
                <p className="mb-5 max-w-[56ch] text-lg">
                  Every update for this event goes in this group. Join it now with the number you registered, then continue to payment.
                </p>
                <a
                  href={event.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dd-btn dd-display inline-flex min-h-14 w-full items-center justify-center bg-[#25d366] px-8 text-2xl text-[#04230f] transition-opacity hover:opacity-90 sm:w-auto"
                >
                  Join the WhatsApp group
                </a>
                {event.whatsappQr && (
                  <div className="mt-8 hidden sm:block">
                    <p className="mb-3 text-base text-[var(--dd-iron)]/80">On a computer? Scan this with the WhatsApp camera on your phone.</p>
                    <div className="relative h-44 w-44 bg-white p-2">
                      <Image src={event.whatsappQr} alt={`WhatsApp group QR code for ${event.title}`} fill sizes="176px" className="object-contain p-2" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="max-w-[56ch] text-lg">
                The group link for this event will be shared here soon. Your coordinators will also message you.
                {event.coordinators.length > 0 && (
                  <>
                    {" "}
                    Coordinators:{" "}
                    {event.coordinators.map((c, i) => (
                      <span key={c.name}>
                        {i > 0 && ", "}
                        {c.name}
                        {c.phone && (
                          <>
                            {" "}
                            <a href={`tel:+91${c.phone}`} className="dd-link underline underline-offset-2 hover:text-[var(--dd-glow)]">
                              {c.phone}
                            </a>
                          </>
                        )}
                      </span>
                    ))}
                    .
                  </>
                )}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--dd-iron)]/15 pt-8">
            <p className="mb-4 text-lg">{info.paymentStatus === "verified" ? "Your registration is confirmed." : info.paymentStatus === "submitted" ? "Your payment is submitted and waiting to be checked." : info.paymentStatus === "rejected" ? "Your payment was not accepted. You can send it again." : "Your registration is not complete until you pay."}</p>
            {info.canPay && (
              <Link
                href={`/ieee-week/register/payment?r=${id}`}
                className="dd-btn dd-display inline-flex min-h-14 w-full items-center justify-center bg-[var(--dd-glow)] px-8 text-2xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)] sm:w-auto"
              >
                Continue to payment
              </Link>
            )}
          </div>
        </div>
      )}
    </RegisterShell>
  );
}
