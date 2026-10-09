"use client";

import { useMemo, useState } from "react";
import { Badge, Call, Chip, Dialog, Empty, SearchBox, Skeleton, Switch, useList, useToast } from "./ui";
import { EventRow, Registration, rupees } from "./model";

type View = "all" | "upcoming" | "past" | "open" | "hidden";

const blankEvent = (): Omit<EventRow, "id"> => ({
  slug: "", title: "", date_label: "", event_date: null, venue: "", description: "", long_description: "",
  tags: [], image_url: "", gallery: [], status: "upcoming", published: true, registration_open: false,
  fee_amount: 0, payment_instructions: "", max_registrations: null, sort_order: 0,
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** The save API wants the whole event, so quick switches send the row back with one change. */
const payload = (e: EventRow, change: Partial<EventRow>) => ({ ...e, ...change, event_date: (change.event_date ?? e.event_date) || "" });

export default function Events({ call, csrf, api }: { call: Call; csrf: string; api: string }) {
  const { items, error, reload } = useList<EventRow>(call, "events");
  const regs = useList<Registration>(call, "registrations");
  const toast = useToast();
  const [editing, setEditing] = useState<(Omit<EventRow, "id"> & { id?: string }) | null>(null);
  const [view, setView] = useState<View>("all");
  const [q, setQ] = useState("");
  const [del, setDel] = useState<EventRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const stats = useMemo(() => {
    const m = new Map<string, { total: number; pending: number; approved: number }>();
    for (const r of regs.items ?? []) {
      const s = m.get(r.event_id) ?? { total: 0, pending: 0, approved: 0 };
      if (r.status !== "rejected") s.total++;
      if (r.status === "pending") s.pending++;
      if (r.status === "approved") s.approved++;
      m.set(r.event_id, s);
    }
    return m;
  }, [regs.items]);

  const all = useMemo(() => items ?? [], [items]);
  const counts = useMemo(
    () => ({
      all: all.length,
      upcoming: all.filter((e) => e.status === "upcoming").length,
      past: all.filter((e) => e.status === "past").length,
      open: all.filter((e) => e.registration_open).length,
      hidden: all.filter((e) => !e.published).length,
    }),
    [all],
  );
  const shown = all.filter((e) => {
    if (view === "upcoming" && e.status !== "upcoming") return false;
    if (view === "past" && e.status !== "past") return false;
    if (view === "open" && !e.registration_open) return false;
    if (view === "hidden" && e.published) return false;
    const n = q.trim().toLowerCase();
    return !n || `${e.title} ${e.slug} ${e.venue} ${e.tags.join(" ")}`.toLowerCase().includes(n);
  });

  const quick = async (e: EventRow, change: Partial<EventRow>, msg: string) => {
    setBusy(e.id);
    try {
      await call("events", "PUT", payload(e, change));
      toast(msg);
      await reload();
    } catch (x) {
      toast((x as Error).message, true);
    } finally {
      setBusy(null);
    }
  };

  if (editing) return <EventForm initial={editing} call={call} csrf={csrf} api={api} onDone={() => { setEditing(null); reload(); }} />;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Events</h1>
          <p>Turn events on and off, open registration and edit details. Switches save straight away.</p>
        </div>
        <button className="adm-btn primary" onClick={() => setEditing(blankEvent())}>New event</button>
      </div>

      <div className="adm-chips" role="group" aria-label="Filter events">
        {([["all", "All"], ["upcoming", "Upcoming"], ["past", "Past"], ["open", "Registration open"], ["hidden", "Hidden"]] as const).map(([k, l]) => (
          <Chip key={k} active={view === k} onClick={() => setView(k)} count={counts[k]}>{l}</Chip>
        ))}
      </div>
      <div className="adm-toolbar"><SearchBox value={q} onChange={setQ} placeholder="Search events" /></div>

      {error && <div className="adm-flag bad" role="alert">{error}</div>}
      {!items ? <Skeleton /> : shown.length === 0 ? (
        <div className="adm-card"><Empty title="No events match" hint="Change the filter or create a new event." /></div>
      ) : (
        <div className="adm-tablewrap">
          <table className="adm-table" style={{ minWidth: 900 }}>
            <thead>
              <tr><th>Event</th><th>When</th><th>Status</th><th>Visible on site</th><th>Registration open</th><th>Fee</th><th>Registrations</th><th /></tr>
            </thead>
            <tbody>
              {shown.map((e) => {
                const s = stats.get(e.id);
                return (
                  <tr key={e.id}>
                    <td><span className="adm-cell-title">{e.title}</span><span className="adm-cell-sub">/{e.slug}{e.venue ? ` · ${e.venue}` : ""}</span></td>
                    <td>{e.date_label || "-"}</td>
                    <td><Badge tone={e.status === "upcoming" ? "info" : "mute"}>{e.status === "upcoming" ? "Upcoming" : "Past"}</Badge></td>
                    <td><Switch on={e.published} disabled={busy === e.id} label={`${e.title} visible on site`} onChange={(v) => quick(e, { published: v }, v ? "Now visible on the site" : "Hidden from the site")} /></td>
                    <td><Switch on={e.registration_open} disabled={busy === e.id} label={`${e.title} registration open`} onChange={(v) => quick(e, { registration_open: v }, v ? "Registration is open" : "Registration closed")} /></td>
                    <td>{e.fee_amount > 0 ? rupees(e.fee_amount) : "Free"}</td>
                    <td>
                      {s ? <>{s.total}{e.max_registrations ? ` / ${e.max_registrations}` : ""} <span className="adm-cell-sub">{s.pending} pending, {s.approved} approved</span></> : <span className="adm-cell-sub">None</span>}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="adm-btn sm" onClick={() => setEditing(e)}>Edit</button>{" "}
                      <button className="adm-btn sm ghost" onClick={() => setDel(e)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {del && (
        <Dialog
          title={`Delete "${del.title}"?`}
          body="This also deletes all of its registrations and their payment screenshots. It cannot be undone."
          confirm="Delete event"
          danger
          onCancel={() => setDel(null)}
          onConfirm={async () => {
            const e = del;
            setDel(null);
            try { await call("events", "DELETE", { id: e.id }); toast("Event deleted"); reload(); } catch (x) { toast((x as Error).message, true); }
          }}
        />
      )}
    </>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="adm-label">{label}</label>
      {children}
      {hint && <p style={{ margin: "4px 0 0", color: "var(--a-faint)", fontSize: 12 }}>{hint}</p>}
    </div>
  );
}

function EventForm({ initial, call, csrf, api, onDone }: {
  initial: Omit<EventRow, "id"> & { id?: string };
  call: Call; csrf: string; api: string; onDone: () => void;
}) {
  const toast = useToast();
  const [f, setF] = useState(initial);
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [gallery, setGallery] = useState(initial.gallery.join("\n"));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const upload = async (file: File | undefined): Promise<string | null> => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${api}/upload`, { method: "POST", credentials: "same-origin", headers: { "x-csrf-token": csrf }, body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error || "Upload failed"); return null; }
    return data.url as string;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const body = {
      ...f,
      event_date: f.event_date || "",
      fee_amount: Number(f.fee_amount) || 0,
      max_registrations: f.max_registrations ? Number(f.max_registrations) : null,
      sort_order: Number(f.sort_order) || 0,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      gallery: gallery.split("\n").map((t) => t.trim()).filter(Boolean),
    };
    try {
      await call("events", f.id ? "PUT" : "POST", body);
      toast("Event saved");
      onDone();
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      <div className="adm-head" style={{ marginBottom: 0 }}>
        <div><h1>{f.id ? "Edit event" : "New event"}</h1><p>{f.id ? f.slug : "Fill in the basics, then save."}</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="adm-btn" onClick={onDone}>Cancel</button>
          <button disabled={busy} className="adm-btn primary">{busy ? "Saving" : "Save event"}</button>
        </div>
      </div>
      {err && <div className="adm-flag bad" role="alert">{err}</div>}

      <section className="adm-sec">
        <h3>Basics</h3>
        <div className="adm-grid2">
          <Field label="Title"><input required className="adm-input" value={f.title} maxLength={160} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} /></Field>
          <Field label="Web address (slug)"><input required className="adm-input" value={f.slug} maxLength={80} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field>
          <Field label="Status">
            <select className="adm-input" value={f.status} onChange={(e) => set("status", e.target.value as "upcoming" | "past")}>
              <option value="upcoming">Upcoming</option><option value="past">Past</option>
            </select>
          </Field>
          <Field label="Date shown on site"><input className="adm-input" placeholder="14 October 2026" value={f.date_label} maxLength={80} onChange={(e) => set("date_label", e.target.value)} /></Field>
          <Field label="Event date"><input type="date" className="adm-input" value={f.event_date ?? ""} onChange={(e) => set("event_date", e.target.value || null)} /></Field>
          <Field label="Venue"><input className="adm-input" value={f.venue} maxLength={200} onChange={(e) => set("venue", e.target.value)} /></Field>
          <Field label="Tags" hint="Separate with commas"><input className="adm-input" value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
          <Field label="Sort order" hint="Lower numbers come first"><input type="number" className="adm-input" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
        </div>
      </section>

      <section className="adm-sec">
        <h3>Description</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Short description" hint="Up to 600 characters"><textarea className="adm-input" rows={2} maxLength={600} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Full description" hint="Up to 8000 characters"><textarea className="adm-input" rows={6} maxLength={8000} value={f.long_description} onChange={(e) => set("long_description", e.target.value)} /></Field>
        </div>
      </section>

      <section className="adm-sec">
        <h3>Images</h3>
        <div className="adm-grid2">
          <Field label="Cover image" hint="A /images/ path or upload a file">
            <input className="adm-input" value={f.image_url} onChange={(e) => set("image_url", e.target.value)} />
            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ marginTop: 8 }} onChange={async (e) => { const u = await upload(e.target.files?.[0]); if (u) set("image_url", u); e.target.value = ""; }} />
            {f.image_url && /^(\/images|https:)/.test(f.image_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image_url} alt="" style={{ marginTop: 8, height: 90, borderRadius: 8, objectFit: "cover" }} />
            )}
          </Field>
          <Field label="Gallery" hint="One image address per line">
            <textarea className="adm-input" rows={4} value={gallery} onChange={(e) => setGallery(e.target.value)} />
            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ marginTop: 8 }} onChange={async (e) => { const u = await upload(e.target.files?.[0]); if (u) setGallery((g) => (g ? g + "\n" : "") + u); e.target.value = ""; }} />
          </Field>
        </div>
      </section>

      <section className="adm-sec">
        <h3>Registration</h3>
        <div className="adm-grid2">
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}><Switch on={f.published} label="Visible on site" onChange={(v) => set("published", v)} /> Visible on the site</label>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}><Switch on={f.registration_open} label="Registration open" onChange={(v) => set("registration_open", v)} /> Registration open</label>
          <Field label="Fee in rupees" hint="0 means free"><input type="number" min={0} className="adm-input" value={f.fee_amount} onChange={(e) => set("fee_amount", Number(e.target.value))} /></Field>
          <Field label="Maximum registrations" hint="Leave blank for no limit"><input type="number" min={1} className="adm-input" value={f.max_registrations ?? ""} onChange={(e) => set("max_registrations", e.target.value ? Number(e.target.value) : null)} /></Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Payment instructions"><textarea className="adm-input" rows={3} maxLength={1000} value={f.payment_instructions} onChange={(e) => set("payment_instructions", e.target.value)} /></Field>
        </div>
      </section>
    </form>
  );
}
