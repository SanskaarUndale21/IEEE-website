"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "overview" | "events" | "registrations" | "memberships" | "queries";
type Status = "pending" | "approved" | "rejected";

interface Props {
  basePath: string;
  authed: boolean;
  csrf: string;
  adminId: string;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  date_label: string;
  event_date: string | null;
  venue: string;
  description: string;
  long_description: string;
  tags: string[];
  image_url: string;
  gallery: string[];
  status: "upcoming" | "past";
  published: boolean;
  registration_open: boolean;
  fee_amount: number;
  payment_instructions: string;
  max_registrations: number | null;
  sort_order: number;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  usn: string;
  college: string;
  branch: string;
  semester: string;
  team_name: string;
  transaction_id: string;
  has_proof: boolean;
  status: Status;
  admin_note: string;
  created_at: string;
  events: { title: string; slug: string; fee_amount: number } | null;
}

interface Membership {
  id: string;
  name: string;
  email: string;
  semester: string;
  branch: string;
  dob: string | null;
  contact: string;
  security_question: string;
  security_answer: string;
  status: Status;
  admin_note: string;
  created_at: string;
}

interface QueryRow {
  id: string;
  email: string;
  phone: string;
  topic: string;
  status: "open" | "resolved";
  created_at: string;
}

const blankEvent = (): Omit<EventRow, "id"> => ({
  slug: "", title: "", date_label: "", event_date: null, venue: "", description: "", long_description: "",
  tags: [], image_url: "", gallery: [], status: "upcoming", published: true, registration_open: false,
  fee_amount: 0, payment_instructions: "", max_registrations: null, sort_order: 0,
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function AdminApp({ basePath, authed, csrf, adminId }: Props) {
  const api = `${basePath}/api`;

  const call = useCallback(
    async (path: string, method = "GET", body?: unknown) => {
      const res = await fetch(`${api}/${path}`, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(method !== "GET" ? { "x-csrf-token": csrf } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) {
        window.location.reload();
        throw new Error("Session expired");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    },
    [api, csrf]
  );

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-[var(--bg)] text-[var(--text-primary)]">
      {authed ? <Dashboard call={call} api={api} csrf={csrf} adminId={adminId} /> : <Login api={api} />}
    </div>
  );
}

/* ─────────────────────────── Login ─────────────────────────── */

function Login({ api }: { api: string }) {
  const [ieeeId, setId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${api}/login`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ieeeId, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} autoComplete="off" className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-lg)]">
        <div>
          <p className="section-label mb-1">Restricted</p>
          <h1 className="font-display text-2xl font-bold">Web Master Console</h1>
        </div>
        <div>
          <label className="label-field">IEEE ID</label>
          <input className="input-field" inputMode="numeric" value={ieeeId} onChange={(e) => setId(e.target.value)} required autoComplete="off" />
        </div>
        <div>
          <label className="label-field">Password</label>
          <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
        </div>
        <button disabled={busy} className="btn-primary-sq w-full justify-center py-3 disabled:opacity-60">
          {busy ? "Checking..." : "Sign in"}
        </button>
        {err && <p className="text-center text-xs text-red-500">{err}</p>}
      </form>
    </main>
  );
}

/* ─────────────────────────── Dashboard ─────────────────────────── */

type Call = (path: string, method?: string, body?: unknown) => Promise<any>;

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "events", label: "Events" },
  { id: "registrations", label: "Registrations" },
  { id: "memberships", label: "Memberships" },
  { id: "queries", label: "Queries" },
];

function Dashboard({ call, api, csrf, adminId }: { call: Call; api: string; csrf: string; adminId: string }) {
  const [tab, setTab] = useState<Tab>("overview");

  const logout = async () => {
    try {
      await call("logout", "POST", {});
    } catch {}
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">IEEE SGBIT</p>
          <h1 className="font-display text-2xl font-bold">Admin Console</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>Sanskaar, Web Master · ID {adminId}</span>
          <button onClick={logout} className="btn-outline-sq px-4 py-2 text-xs">Log out</button>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t.id ? "bg-[var(--ieee-blue)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview call={call} go={setTab} />}
      {tab === "events" && <Events call={call} csrf={csrf} api={api} />}
      {tab === "registrations" && <Registrations call={call} />}
      {tab === "memberships" && <Memberships call={call} />}
      {tab === "queries" && <Queries call={call} />}
    </div>
  );
}

function useList<T>(call: Call, path: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setItems((await call(path)).items);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [call, path]);
  useEffect(() => { load(); }, [load]);
  return { items, error, reload: load };
}

const card = "rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4";
const btnSm = "rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50";

function StatusBadge({ s }: { s: string }) {
  const c =
    s === "approved" || s === "resolved" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
    : s === "rejected" ? "bg-red-500/15 text-red-600 dark:text-red-400"
    : "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c}`}>{s}</span>;
}

function Overview({ call, go }: { call: Call; go: (t: Tab) => void }) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { call("overview").then(setD).catch((e) => setErr(e.message)); }, [call]);
  if (err) return <p className="text-red-500">{err}</p>;
  if (!d) return <p className="text-[var(--text-muted)]">Loading...</p>;

  const stats: [string, number, Tab][] = [
    ["Pending registrations", d.pendingRegistrations, "registrations"],
    ["Pending memberships", d.pendingMemberships, "memberships"],
    ["Open queries", d.openQueries, "queries"],
    ["Upcoming events", d.upcomingEvents, "events"],
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, n, t]) => (
          <button key={label} onClick={() => go(t)} className={`${card} text-left transition-colors hover:border-[var(--ieee-light)]`}>
            <p className="font-display text-3xl font-black text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">{n}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{label}</p>
          </button>
        ))}
      </div>
      <div className={card}>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Recent admin activity</p>
        <ul className="divide-y divide-[var(--border)] text-xs">
          {d.audit.map((a: any) => (
            <li key={a.id} className="flex justify-between gap-3 py-2">
              <span>{a.action}{a.target ? <span className="text-[var(--text-muted)]"> · {String(a.target).slice(0, 36)}</span> : null}</span>
              <span className="text-[var(--text-muted)]">{fmt(a.created_at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────── Events ─────────────────────────── */

function Events({ call, csrf, api }: { call: Call; csrf: string; api: string }) {
  const { items, error, reload } = useList<EventRow>(call, "events");
  const [editing, setEditing] = useState<(Omit<EventRow, "id"> & { id?: string }) | null>(null);

  const remove = async (e: EventRow) => {
    if (!confirm(`Delete "${e.title}" and all its registrations? This cannot be undone.`)) return;
    try { await call("events", "DELETE", { id: e.id }); reload(); } catch (x) { alert((x as Error).message); }
  };

  if (editing) {
    return <EventForm initial={editing} call={call} csrf={csrf} api={api} onDone={() => { setEditing(null); reload(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Events</h2>
        <button onClick={() => setEditing(blankEvent())} className="btn-primary-sq px-5 py-2 text-xs">+ New event</button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!items ? <p className="text-[var(--text-muted)]">Loading...</p> : (
        <div className="grid gap-3">
          {items.map((e) => (
            <div key={e.id} className={`${card} flex flex-wrap items-center justify-between gap-3`}>
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {e.status} · {e.date_label || "no date"} · /events/{e.slug}
                  {!e.published && " · HIDDEN"}
                  {e.registration_open && " · REGISTRATION OPEN"}
                  {e.fee_amount > 0 && ` · ₹${e.fee_amount}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button className={`${btnSm} border border-[var(--border-strong)]`} onClick={() => setEditing(e)}>Edit</button>
                <button className={`${btnSm} bg-red-500/15 text-red-600 dark:text-red-400`} onClick={() => remove(e)}>Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-[var(--text-muted)]">No events yet.</p>}
        </div>
      )}
    </div>
  );
}

function EventForm({ initial, call, csrf, api, onDone }: {
  initial: Omit<EventRow, "id"> & { id?: string };
  call: Call; csrf: string; api: string; onDone: () => void;
}) {
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
    const payload = {
      ...f,
      event_date: f.event_date || "",
      fee_amount: Number(f.fee_amount) || 0,
      max_registrations: f.max_registrations ? Number(f.max_registrations) : null,
      sort_order: Number(f.sort_order) || 0,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      gallery: gallery.split("\n").map((t) => t.trim()).filter(Boolean),
    };
    try {
      await call("events", f.id ? "PUT" : "POST", payload);
      onDone();
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className={`${card} space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{f.id ? "Edit event" : "New event"}</h2>
        <button type="button" onClick={onDone} className={`${btnSm} border border-[var(--border-strong)]`}>Cancel</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input required className="input-field" value={f.title} maxLength={160}
            onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
        </Field>
        <Field label="Slug (URL)">
          <input required className="input-field" value={f.slug} maxLength={80}
            onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
        </Field>
        <Field label="Status">
          <select className="input-field" value={f.status} onChange={(e) => set("status", e.target.value as "upcoming" | "past")}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </Field>
        <Field label="Date label (shown on site)">
          <input className="input-field" placeholder="March 2026" value={f.date_label} maxLength={80} onChange={(e) => set("date_label", e.target.value)} />
        </Field>
        <Field label="Event date">
          <input type="date" className="input-field" value={f.event_date ?? ""} onChange={(e) => set("event_date", e.target.value || null)} />
        </Field>
        <Field label="Venue">
          <input className="input-field" value={f.venue} maxLength={200} onChange={(e) => set("venue", e.target.value)} />
        </Field>
        <Field label="Sort order (lower first)">
          <input type="number" className="input-field" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
        </Field>
        <Field label="Tags (comma separated)">
          <input className="input-field" value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>
      </div>

      <Field label="Short description (max 600)">
        <textarea className="input-field" rows={2} maxLength={600} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <Field label="Full description (max 8000)">
        <textarea className="input-field" rows={6} maxLength={8000} value={f.long_description} onChange={(e) => set("long_description", e.target.value)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cover image (/images/... path or upload)">
          <input className="input-field" value={f.image_url} onChange={(e) => set("image_url", e.target.value)} />
          <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 text-xs"
            onChange={async (e) => { const u = await upload(e.target.files?.[0]); if (u) set("image_url", u); e.target.value = ""; }} />
          {f.image_url && /^(\/images|https:)/.test(f.image_url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.image_url} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </Field>
        <Field label="Gallery (one image URL per line)">
          <textarea className="input-field" rows={4} value={gallery} onChange={(e) => setGallery(e.target.value)} />
          <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 text-xs"
            onChange={async (e) => { const u = await upload(e.target.files?.[0]); if (u) setGallery((g) => (g ? g + "\n" : "") + u); e.target.value = ""; }} />
        </Field>
      </div>

      <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 md:grid-cols-2">
        <Check label="Published (visible on site)" v={f.published} on={(v) => set("published", v)} />
        <Check label="Registration open" v={f.registration_open} on={(v) => set("registration_open", v)} />
        <Field label="Fee in ₹ (0 = free, no payment proof needed)">
          <input type="number" min={0} className="input-field" value={f.fee_amount} onChange={(e) => set("fee_amount", Number(e.target.value))} />
        </Field>
        <Field label="Max registrations (blank = unlimited)">
          <input type="number" min={1} className="input-field" value={f.max_registrations ?? ""} onChange={(e) => set("max_registrations", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Payment instructions (UPI id, account, etc.)">
            <textarea className="input-field" rows={2} maxLength={1000} value={f.payment_instructions} onChange={(e) => set("payment_instructions", e.target.value)} />
          </Field>
        </div>
      </div>

      {err && <p className="text-sm text-red-500">{err}</p>}
      <button disabled={busy} className="btn-primary-sq px-8 py-3 text-sm disabled:opacity-60">{busy ? "Saving..." : "Save event"}</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label-field">{label}</label>{children}</div>;
}

function Check({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

/* ─────────────────────────── Registrations ─────────────────────────── */

function Registrations({ call }: { call: Call }) {
  const { items, error, reload } = useList<Registration>(call, "registrations");
  const [filter, setFilter] = useState<Status | "all">("pending");
  const [eventFilter, setEventFilter] = useState("all");
  const [proof, setProof] = useState<{ id: string; url: string } | null>(null);
  const [proofErr, setProofErr] = useState("");

  const events = useMemo(() => Array.from(new Set((items ?? []).map((r) => r.events?.title).filter(Boolean))) as string[], [items]);
  const shown = (items ?? []).filter((r) => (filter === "all" || r.status === filter) && (eventFilter === "all" || r.events?.title === eventFilter));

  const review = async (id: string, status: Status) => {
    const note = status === "rejected" ? prompt("Reason for rejection (optional)") ?? "" : "";
    try { await call("registrations", "PATCH", { id, status, note }); reload(); } catch (x) { alert((x as Error).message); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this registration and its payment proof?")) return;
    try { await call("registrations", "DELETE", { id }); reload(); } catch (x) { alert((x as Error).message); }
  };
  const view = async (id: string) => {
    setProofErr("");
    try { const d = await call(`proof?id=${id}`); setProof({ id, url: d.url }); } catch (x) { setProofErr((x as Error).message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-bold">Event registrations</h2>
        <select className="input-field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value as Status | "all")}>
          <option value="pending">Pending</option><option value="approved">Approved</option>
          <option value="rejected">Rejected</option><option value="all">All</option>
        </select>
        <select className="input-field !w-auto" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="all">All events</option>
          {events.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-[var(--text-muted)]">{shown.length} shown</span>
      </div>
      {(error || proofErr) && <p className="text-red-500">{error || proofErr}</p>}
      {!items ? <p className="text-[var(--text-muted)]">Loading...</p> : (
        <div className="grid gap-3">
          {shown.map((r) => (
            <div key={r.id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold">{r.name} <StatusBadge s={r.status} /></p>
                  <p className="text-xs text-[var(--text-secondary)]">{r.events?.title} · {fmt(r.created_at)}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {r.email} · {r.phone}<br />
                    {[r.usn, r.college, r.branch, r.semester && `Sem ${r.semester}`, r.team_name && `Team ${r.team_name}`].filter(Boolean).join(" · ")}
                    {r.transaction_id && <><br />Txn: <b>{r.transaction_id}</b></>}
                    {r.admin_note && <><br />Note: {r.admin_note}</>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.has_proof && <button className={`${btnSm} border border-[var(--border-strong)]`} onClick={() => view(r.id)}>View payment</button>}
                  <button className={`${btnSm} bg-emerald-600 text-white`} disabled={r.status === "approved"} onClick={() => review(r.id, "approved")}>Approve</button>
                  <button className={`${btnSm} bg-red-600 text-white`} disabled={r.status === "rejected"} onClick={() => review(r.id, "rejected")}>Reject</button>
                  <button className={`${btnSm} text-[var(--text-muted)]`} onClick={() => del(r.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="text-[var(--text-muted)]">Nothing here.</p>}
        </div>
      )}

      {proof && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4" onClick={() => setProof(null)}>
          <div className="max-h-full max-w-3xl overflow-auto rounded-xl bg-[var(--bg-card)] p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proof.url} alt="Payment proof" className="mx-auto max-h-[70vh] rounded-lg" referrerPolicy="no-referrer" />
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className={`${btnSm} bg-emerald-600 text-white`} onClick={async () => { await review(proof.id, "approved"); setProof(null); }}>Approve</button>
              <button className={`${btnSm} bg-red-600 text-white`} onClick={async () => { await review(proof.id, "rejected"); setProof(null); }}>Reject</button>
              <button className={`${btnSm} border border-[var(--border-strong)]`} onClick={() => setProof(null)}>Close</button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--text-muted)]">Link expires in 2 minutes</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Memberships ─────────────────────────── */

function Memberships({ call }: { call: Call }) {
  const { items, error, reload } = useList<Membership>(call, "memberships");
  const [filter, setFilter] = useState<Status | "all">("pending");
  const shown = (items ?? []).filter((m) => filter === "all" || m.status === filter);

  const review = async (id: string, status: Status) => {
    try { await call("memberships", "PATCH", { id, status, note: "" }); reload(); } catch (x) { alert((x as Error).message); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    try { await call("memberships", "DELETE", { id }); reload(); } catch (x) { alert((x as Error).message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-bold">Membership applications</h2>
        <select className="input-field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value as Status | "all")}>
          <option value="pending">Pending</option><option value="approved">Approved</option>
          <option value="rejected">Rejected</option><option value="all">All</option>
        </select>
        <span className="text-xs text-[var(--text-muted)]">{shown.length} shown</span>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!items ? <p className="text-[var(--text-muted)]">Loading...</p> : (
        <div className="grid gap-3">
          {shown.map((m) => (
            <div key={m.id} className={`${card} flex flex-wrap items-start justify-between gap-3`}>
              <div className="text-sm">
                <p className="font-semibold">{m.name} <StatusBadge s={m.status} /></p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {m.email} · {m.contact}<br />
                  {m.branch} · Sem {m.semester} · DOB {m.dob ?? "-"} · {fmt(m.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <button className={`${btnSm} bg-emerald-600 text-white`} disabled={m.status === "approved"} onClick={() => review(m.id, "approved")}>Approve</button>
                <button className={`${btnSm} bg-red-600 text-white`} disabled={m.status === "rejected"} onClick={() => review(m.id, "rejected")}>Reject</button>
                <button className={`${btnSm} text-[var(--text-muted)]`} onClick={() => del(m.id)}>Delete</button>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="text-[var(--text-muted)]">Nothing here.</p>}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Queries ─────────────────────────── */

function Queries({ call }: { call: Call }) {
  const { items, error, reload } = useList<QueryRow>(call, "queries");
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const shown = (items ?? []).filter((q) => filter === "all" || q.status === filter);

  const setStatus = async (id: string, status: "open" | "resolved") => {
    try { await call("queries", "PATCH", { id, status }); reload(); } catch (x) { alert((x as Error).message); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this query?")) return;
    try { await call("queries", "DELETE", { id }); reload(); } catch (x) { alert((x as Error).message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-bold">Contact queries</h2>
        <select className="input-field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value as "open" | "resolved" | "all")}>
          <option value="open">Open</option><option value="resolved">Resolved</option><option value="all">All</option>
        </select>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!items ? <p className="text-[var(--text-muted)]">Loading...</p> : (
        <div className="grid gap-3">
          {shown.map((q) => (
            <div key={q.id} className={`${card} flex flex-wrap items-start justify-between gap-3`}>
              <div className="min-w-0 text-sm">
                <p className="font-semibold">{q.email || q.phone} <StatusBadge s={q.status} /></p>
                <p className="text-xs text-[var(--text-muted)]">{[q.email, q.phone].filter(Boolean).join(" · ")} · {fmt(q.created_at)}</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-xs text-[var(--text-secondary)]">{q.topic || "(no message)"}</p>
              </div>
              <div className="flex gap-2">
                <button className={`${btnSm} bg-emerald-600 text-white`} onClick={() => setStatus(q.id, q.status === "open" ? "resolved" : "open")}>
                  {q.status === "open" ? "Resolve" : "Reopen"}
                </button>
                <button className={`${btnSm} text-[var(--text-muted)]`} onClick={() => del(q.id)}>Delete</button>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="text-[var(--text-muted)]">Nothing here.</p>}
        </div>
      )}
    </div>
  );
}
