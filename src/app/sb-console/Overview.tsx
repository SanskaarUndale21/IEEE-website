"use client";

import { useEffect, useMemo, useState } from "react";
import { Call, Skeleton, useList } from "./ui";
import { ACTION_LABELS, EventRow, Registration, fmtLong, parseRegistration, reviewState, rupees } from "./model";

type Tab = "overview" | "registrations" | "events" | "memberships" | "queries";

interface Audit { id: string; action: string; target: string | null; created_at: string }
interface Data { pendingMemberships: number; openQueries: number; pendingRegistrations: number; upcomingEvents: number; audit: Audit[] }

export default function Overview({ call, go }: { call: Call; go: (t: Tab) => void }) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const regs = useList<Registration>(call, "registrations");
  const events = useList<EventRow>(call, "events");

  useEffect(() => {
    call("overview").then(setD).catch((e) => setErr(e.message));
  }, [call]);

  const perEvent = useMemo(() => {
    const m = new Map<string, { title: string; day: number | null; awaiting: number; review: number; approved: number; rejected: number; money: number; open: boolean }>();
    for (const e of events.items ?? []) if (e.slug.startsWith("ieee-week-")) m.set(e.id, { title: e.title, day: null, awaiting: 0, review: 0, approved: 0, rejected: 0, money: 0, open: e.registration_open });
    for (const r of regs.items ?? []) {
      const row = m.get(r.event_id);
      if (!row) continue;
      const p = parseRegistration(r);
      row.day = p.day;
      const s = reviewState(r, p);
      row[s]++;
      if (s === "approved") row.money += p.amount ?? 0;
    }
    return Array.from(m.values()).sort((a, b) => (a.day ?? 99) - (b.day ?? 99) || a.title.localeCompare(b.title));
  }, [regs.items, events.items]);

  if (err) return <div className="adm-flag bad" role="alert">{err}</div>;
  if (!d) return <Skeleton />;

  const stats: [string, number, Tab, boolean][] = [
    ["Registrations to review", d.pendingRegistrations, "registrations", d.pendingRegistrations > 0],
    ["Pending memberships", d.pendingMemberships, "memberships", d.pendingMemberships > 0],
    ["Open queries", d.openQueries, "queries", d.openQueries > 0],
    ["Upcoming events", d.upcomingEvents, "events", false],
  ];
  const total = perEvent.reduce((s, e) => s + e.awaiting + e.review + e.approved, 0);
  const money = perEvent.reduce((s, e) => s + e.money, 0);

  return (
    <>
      <div className="adm-head"><div><h1>Overview</h1><p>What needs you today.</p></div></div>

      <div className="adm-stats">
        {stats.map(([label, n, t, hot]) => (
          <button key={label} className={`adm-stat ${hot ? "hot" : ""}`} onClick={() => go(t)}><b>{n}</b><span>{label}</span></button>
        ))}
      </div>

      <section className="adm-card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "14px 16px 4px" }}>
          <b>IEEE Week registrations</b>
          <span style={{ color: "var(--a-muted)" }}>{total} active teams, {rupees(money)} approved</span>
        </div>
        {perEvent.length === 0 ? (
          <p style={{ padding: 16, color: "var(--a-muted)" }}>No IEEE Week events yet.</p>
        ) : (
          <div className="adm-tablewrap" style={{ border: 0, borderRadius: 0 }}>
            <table className="adm-table" style={{ minWidth: 640 }}>
              <thead><tr><th>Event</th><th>Day</th><th>Registration</th><th>Awaiting payment</th><th>To review</th><th>Approved</th><th>Amount</th></tr></thead>
              <tbody>
                {perEvent.map((e) => (
                  <tr key={e.title}>
                    <td className="adm-cell-title">{e.title}</td>
                    <td>{e.day ?? "-"}</td>
                    <td>{e.open ? "Open" : "Closed"}</td>
                    <td>{e.awaiting}</td>
                    <td><b>{e.review}</b></td>
                    <td>{e.approved}</td>
                    <td>{rupees(e.money)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="adm-card adm-pad">
        <b>Recent admin activity</b>
        <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
          {d.audit.length === 0 && <li style={{ color: "var(--a-muted)" }}>Nothing yet.</li>}
          {d.audit.map((a) => (
            <li key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderTop: "1px solid var(--a-line)" }}>
              <span>{ACTION_LABELS[a.action] ?? a.action}</span>
              <span style={{ color: "var(--a-muted)", whiteSpace: "nowrap" }}>{fmtLong(a.created_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
