"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RegisterShell from "@/components/ieee-week/RegisterShell";
import { REGISTRABLE } from "@/data/ieeeWeek";
import { memberFormatError, normalizePhone, normalizeUsn, teamDuplicateError } from "@/lib/ieeeWeekRules";

type Member = { name: string; usn: string; dept: string; year: string; phone: string };
const blank = (): Member => ({ name: "", usn: "", dept: "", year: "", phone: "" });

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Step1 />
    </Suspense>
  );
}

function Step1() {
  const router = useRouter();
  const params = useSearchParams();
  const [slug, setSlug] = useState(params.get("e") ?? "");
  const [open, setOpen] = useState<Record<string, boolean> | null>(null);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const busy = useRef(false); // blocks a double tap from sending the team twice

  const event = useMemo(() => REGISTRABLE.find((e) => e.slug === slug), [slug]);

  useEffect(() => {
    let alive = true;
    fetch("/api/ieee-week/events")
      .then((r) => r.json())
      .then((d: { events?: { slug: string }[] }) => {
        if (!alive) return;
        const m: Record<string, boolean> = {};
        for (const e of d.events ?? []) m[e.slug] = true;
        setOpen(m);
      })
      .catch(() => alive && setOpen({}));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (event) setMembers(Array.from({ length: event.teamCount }, blank));
  }, [event]);

  const choose = (s: string) => {
    setSlug(s);
    setError("");
    router.replace(`/ieee-week/register?e=${s}`, { scroll: false });
  };

  const setMember = (i: number, k: keyof Member, v: string) =>
    setMembers((ms) => ms.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!event || busy.current) return;
    setError("");
    for (let i = 0; i < members.length; i++) {
      const bad = memberFormatError(members[i], i);
      if (bad) return setError(bad);
    }
    const dup = teamDuplicateError(members);
    if (dup) return setError(dup);
    busy.current = true;
    setSending(true);
    try {
      const res = await fetch("/api/ieee-week/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: event.slug,
          teamName,
          members: members.map((m) => ({ ...m, usn: normalizeUsn(m.usn), phone: normalizePhone(m.phone) })),
          website: "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; id?: string };
      if (!res.ok || !data.success || !data.id) {
        setError(data.error ?? "Could not save your registration. Try again.");
        busy.current = false;
        setSending(false);
        return;
      }
      router.push(`/ieee-week/register/whatsapp?r=${data.id}`);
    } catch {
      setError("No connection. Check your internet and try again.");
      busy.current = false;
      setSending(false);
    }
  }

  return (
    <RegisterShell step={1} title="Register your team">
      <fieldset className="mb-10">
        <legend className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">Event</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {REGISTRABLE.map((e) => (
            <label
              key={e.slug}
              className={`flex min-h-14 cursor-pointer items-center gap-3 border px-4 py-3 transition-colors ${
                e.slug === slug ? "border-[var(--dd-glow)] bg-[var(--dd-glow)]/10" : "border-[var(--dd-iron)]/25 hover:border-[var(--dd-iron)]/60"
              }`}
            >
              <input type="radio" name="event" value={e.slug} checked={e.slug === slug} onChange={() => choose(e.slug)} className="h-5 w-5 accent-[#46f0a0]" />
              <span>
                <span className="block text-lg leading-tight">{e.title}</span>
                <span className="block text-sm text-[var(--dd-iron)]/65">
                  {e.day}-10-26, {e.category}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {event && (
        <form onSubmit={submit} className="space-y-10">
          <p className="text-base text-[var(--dd-iron)]/85">
            {event.venue}, {event.time}. Team of {event.teamCount}
            {event.roles ? ` (${event.roles})` : ""}.
          </p>

          {open !== null && !open[event.slug] && (
            <p className="border border-[var(--dd-gold)]/50 bg-[var(--dd-gold)]/10 p-4 text-lg" role="status">
              Registration for {event.title} opens soon. The form is ready, check back here.
            </p>
          )}

          <fieldset disabled={open === null || !open[event.slug] || sending} className="space-y-10 disabled:opacity-60">
            <div>
              <label htmlFor="teamName" className="dd-label">
                Team name
              </label>
              <input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} required maxLength={120} className="dd-field" />
            </div>

            {members.map((m, i) => (
              <div key={`${event.slug}-${i}`}>
                <p className="dd-display mb-4 text-3xl text-[var(--dd-gold)]">
                  {i === 0 ? "Team lead" : `Member ${i + 1}`}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Name" value={m.name} onChange={(v) => setMember(i, "name", v)} max={80} autoComplete={i === 0 ? "name" : "off"} className="sm:col-span-2" />
                  <Input label="USN" value={m.usn} onChange={(v) => setMember(i, "usn", v)} max={30} autoCapitalize="characters" />
                  <Input label="Department" value={m.dept} onChange={(v) => setMember(i, "dept", v)} max={80} />
                  <div>
                    <label htmlFor={`year-${i}`} className="dd-label">
                      Year
                    </label>
                    <select id={`year-${i}`} value={m.year} onChange={(e) => setMember(i, "year", e.target.value)} required className="dd-field">
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="1">1st year</option>
                      <option value="2">2nd year</option>
                      <option value="3">3rd year</option>
                      <option value="4">4th year</option>
                    </select>
                  </div>
                  <Input label="Phone number" type="tel" inputMode="tel" value={m.phone} onChange={(v) => setMember(i, "phone", v)} max={20} autoComplete={i === 0 ? "tel" : "off"} />
                </div>
              </div>
            ))}

            {error && (
              <p role="alert" className="border border-red-400/60 bg-red-500/10 p-4 text-lg text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="dd-btn dd-display inline-flex min-h-14 w-full items-center justify-center bg-[var(--dd-glow)] px-8 text-2xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)] disabled:cursor-not-allowed sm:w-auto"
            >
              {sending ? "Saving" : "Save and continue"}
            </button>
          </fieldset>
        </form>
      )}
    </RegisterShell>
  );
}

function Input({
  label,
  value,
  onChange,
  max,
  type = "text",
  className = "",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  type?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "maxLength" | "required">) {
  return (
    <div className={className}>
      <label className="dd-label">
        {label}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required maxLength={max} className="dd-field mt-1.5" {...rest} />
      </label>
    </div>
  );
}
