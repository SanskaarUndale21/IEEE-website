"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Call, Chip, CopyButton, Dialog, Drawer, Empty, SearchBox, Skeleton, useList, useToast } from "./ui";
import { ParsedReg, Registration, ReviewState, STATE_LABEL, Status, downloadCsv, fmtDate, fmtLong, parseRegistration, reviewState, rupees } from "./model";

type Row = { r: Registration; p: ParsedReg; state: ReviewState; dupTxn: boolean; noIeeeId: boolean };
type Sort = "new" | "old" | "team" | "event";
const TONE: Record<ReviewState, "ok" | "warn" | "bad" | "info"> = { approved: "ok", review: "info", awaiting: "warn", rejected: "bad" };

export default function Registrations({ call, focus }: { call: Call; focus?: ReviewState }) {
  const { items, error, reload, loading } = useList<Registration>(call, "registrations");
  const toast = useToast();

  const [state, setState] = useState<ReviewState | "all">(focus ?? "review");
  const [q, setQ] = useState("");
  const [eventId, setEventId] = useState("all");
  const [day, setDay] = useState("all");
  const [plan, setPlan] = useState("all");
  const [sort, setSort] = useState<Sort>("new");
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<null | { kind: "reject" | "delete" | "bulk-approve" | "bulk-reject" | "approve-unpaid"; ids: string[] }>(null);

  const rows: Row[] = useMemo(() => {
    const list = items ?? [];
    const txCount = new Map<string, number>();
    for (const r of list) {
      const t = r.transaction_id.trim().toLowerCase();
      if (t) txCount.set(t, (txCount.get(t) ?? 0) + 1);
    }
    return list.map((r) => {
      const p = parseRegistration(r);
      return {
        r,
        p,
        state: reviewState(r, p),
        dupTxn: Boolean(r.transaction_id) && (txCount.get(r.transaction_id.trim().toLowerCase()) ?? 0) > 1,
        noIeeeId: p.stage === "paid" && p.plan === "ieee" && p.ieeeIds.length === 0,
      };
    });
  }, [items]);

  const events = useMemo(() => {
    const m = new Map<string, string>();
    for (const x of rows) m.set(x.r.event_id, x.p.eventTitle);
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const counts = useMemo(() => {
    const c = { all: rows.length, review: 0, awaiting: 0, approved: 0, rejected: 0 } as Record<string, number>;
    for (const x of rows) c[x.state]++;
    return c;
  }, [rows]);

  const collected = useMemo(() => rows.filter((x) => x.state === "approved").reduce((s, x) => s + (x.p.amount ?? 0), 0), [rows]);
  const pendingMoney = useMemo(() => rows.filter((x) => x.state === "review").reduce((s, x) => s + (x.p.amount ?? 0), 0), [rows]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter((x) => {
      if (state !== "all" && x.state !== state) return false;
      if (eventId !== "all" && x.r.event_id !== eventId) return false;
      if (day !== "all" && String(x.p.day ?? "other") !== day) return false;
      if (plan !== "all" && (x.p.plan ?? "none") !== plan) return false;
      if (!needle) return true;
      const hay = [
        x.r.team_name, x.r.name, x.r.usn, x.r.phone, x.r.email, x.r.transaction_id, x.p.eventTitle,
        ...x.p.people.flatMap((m) => [m.name, m.usn, m.phone]),
        ...x.p.ieeeIds.map((i) => i.id),
      ].join(" ").toLowerCase();
      return hay.includes(needle);
    });
    out.sort((a, b) => {
      if (sort === "old") return a.r.created_at.localeCompare(b.r.created_at);
      if (sort === "team") return (a.r.team_name || a.r.name).localeCompare(b.r.team_name || b.r.name);
      if (sort === "event") return a.p.eventTitle.localeCompare(b.p.eventTitle) || b.r.created_at.localeCompare(a.r.created_at);
      return b.r.created_at.localeCompare(a.r.created_at);
    });
    return out;
  }, [rows, state, q, eventId, day, plan, sort]);

  // Selection only keeps rows that are still on screen.
  useEffect(() => {
    setPicked((s) => {
      const ids = new Set(shown.map((x) => x.r.id));
      const next = new Set(Array.from(s).filter((id) => ids.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [shown]);

  const current = shown.findIndex((x) => x.r.id === open);
  const openRow = open ? rows.find((x) => x.r.id === open) ?? null : null;
  const go = useCallback(
    (d: number) => {
      const i = shown.findIndex((x) => x.r.id === open);
      const n = shown[i + d];
      if (n) setOpen(n.r.id);
    },
    [shown, open],
  );

  const review = useCallback(
    async (ids: string[], status: Status, note = "") => {
      let done = 0;
      for (const id of ids) {
        try {
          await call("registrations", "PATCH", { id, status, note });
          done++;
        } catch (e) {
          toast((e as Error).message, true);
          break;
        }
      }
      if (done) toast(done === 1 ? `Marked ${status}` : `${done} registrations marked ${status}`);
      setPicked(new Set());
      await reload();
    },
    [call, reload, toast],
  );

  const remove = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        try {
          await call("registrations", "DELETE", { id });
        } catch (e) {
          toast((e as Error).message, true);
          break;
        }
      }
      toast("Deleted");
      setOpen(null);
      setPicked(new Set());
      await reload();
    },
    [call, reload, toast],
  );

  const exportCsv = () => {
    const head = ["Submitted", "Event", "Day", "Team", "Status", "Payment", "Plan", "Amount", "Transaction ID", "Member", "Role", "USN", "Department", "Year", "Phone", "IEEE ID"];
    const out: unknown[][] = [head];
    for (const x of shown) {
      const ids = new Map(x.p.ieeeIds.map((i) => [i.member, i.id]));
      x.p.people.forEach((m, i) =>
        out.push([
          x.r.created_at, x.p.eventTitle, x.p.day ?? "", x.r.team_name, STATE_LABEL[x.state], x.p.stage === "awaiting" ? "Awaiting" : "Submitted",
          x.p.plan === "ieee" ? "IEEE" : x.p.plan === "non" ? "Non-IEEE" : "", x.p.amount ?? "", x.r.transaction_id, m.name, m.role, m.usn, m.dept, m.year, m.phone, ids.get(i + 1) ?? "",
        ]),
      );
    }
    downloadCsv(`registrations-${new Date().toISOString().slice(0, 10)}.csv`, out);
    toast(`Exported ${shown.length} registrations`);
  };

  const allPicked = shown.length > 0 && shown.every((x) => picked.has(x.r.id));
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(shown.map((x) => x.r.id)));
  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const filtered = state !== "review" || q || eventId !== "all" || day !== "all" || plan !== "all";
  const reset = () => { setState("review"); setQ(""); setEventId("all"); setDay("all"); setPlan("all"); setSort("new"); };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Registrations</h1>
          <p>Teams that registered for events. Review payments, check IEEE IDs and approve.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="adm-btn" onClick={reload} disabled={loading}>{loading ? "Refreshing" : "Refresh"}</button>
          <button className="adm-btn primary" onClick={exportCsv} disabled={!shown.length}>Export CSV</button>
        </div>
      </div>

      <div className="adm-stats">
        <button className={`adm-stat ${counts.review ? "hot" : ""}`} onClick={() => setState("review")}><b>{counts.review ?? 0}</b><span>To review (payment submitted)</span></button>
        <button className="adm-stat" onClick={() => setState("awaiting")}><b>{counts.awaiting ?? 0}</b><span>Awaiting payment</span></button>
        <button className="adm-stat" onClick={() => setState("approved")}><b>{counts.approved ?? 0}</b><span>Approved</span></button>
        <div className="adm-stat"><b>{rupees(collected)}</b><span>Approved amount</span></div>
        <div className="adm-stat"><b>{rupees(pendingMoney)}</b><span>Waiting for approval</span></div>
      </div>

      <div className="adm-chips" role="group" aria-label="Status">
        {(["review", "awaiting", "approved", "rejected", "all"] as const).map((k) => (
          <Chip key={k} active={state === k} onClick={() => setState(k)} count={counts[k]}>
            {k === "all" ? "All" : STATE_LABEL[k]}
          </Chip>
        ))}
      </div>

      <div className="adm-toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search team, name, USN, phone, transaction or IEEE ID" />
        <select className="adm-input" value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Event">
          <option value="all">All events</option>
          {events.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
        </select>
        <select className="adm-input" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Day">
          <option value="all">All days</option>
          <option value="14">Day 14</option><option value="15">Day 15</option><option value="16">Day 16</option><option value="other">Other events</option>
        </select>
        <select className="adm-input" value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Fee type">
          <option value="all">Any fee type</option><option value="ieee">IEEE price</option><option value="non">Non-IEEE price</option><option value="none">No payment yet</option>
        </select>
        <select className="adm-input" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
          <option value="new">Newest first</option><option value="old">Oldest first</option><option value="team">Team A to Z</option><option value="event">By event</option>
        </select>
        {filtered && <button className="adm-btn ghost" onClick={reset}>Reset filters</button>}
        <span style={{ marginLeft: "auto", color: "var(--a-muted)" }}>{shown.length} of {rows.length}</span>
      </div>

      {error && <div className="adm-flag bad" role="alert">{error}</div>}
      {!items ? <Skeleton /> : shown.length === 0 ? (
        <div className="adm-card"><Empty title={rows.length === 0 ? "No registrations yet" : "No registrations match"} hint={rows.length === 0 ? "They show up here as soon as a team registers." : "Try another status or clear the search."} /></div>
      ) : (
        <>
          <div className="adm-tablewrap responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}><input type="checkbox" className="adm-check" checked={allPicked} onChange={toggleAll} aria-label="Select all" /></th>
                  <th>Team</th><th>Event</th><th>Lead</th><th>Members</th><th>Payment</th><th>Status</th><th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((x) => (
                  <tr key={x.r.id} className="adm-row" tabIndex={0} aria-selected={open === x.r.id} onClick={() => setOpen(x.r.id)} onKeyDown={(e) => e.key === "Enter" && setOpen(x.r.id)}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" className="adm-check" checked={picked.has(x.r.id)} onChange={() => toggle(x.r.id)} aria-label={`Select ${x.r.team_name || x.r.name}`} /></td>
                    <td><span className="adm-cell-title">{x.r.team_name || x.r.name}</span><span className="adm-cell-sub">{x.r.usn}</span></td>
                    <td>{x.p.eventTitle}<span className="adm-cell-sub">{x.p.day ? `Day ${x.p.day}` : "Other"}</span></td>
                    <td>{x.r.name}<span className="adm-cell-sub">{x.r.phone}</span></td>
                    <td>{x.p.people.length}</td>
                    <td>
                      {x.p.stage === "awaiting" ? <span className="adm-cell-sub">Not paid yet</span> : (
                        <>
                          <b>{x.p.amount != null ? rupees(x.p.amount) : x.r.transaction_id ? "Paid" : ""}</b>
                          <span className="adm-cell-sub">{x.p.plan === "ieee" ? "IEEE price" : x.p.plan === "non" ? "Non-IEEE price" : ""}</span>
                          {x.dupTxn && <Badge tone="bad">Duplicate ID</Badge>}{" "}
                          {x.noIeeeId && <Badge tone="warn">No IEEE ID</Badge>}
                        </>
                      )}
                    </td>
                    <td><Badge tone={TONE[x.state]}>{STATE_LABEL[x.state]}</Badge></td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmtDate(x.r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="adm-cards">
            {shown.map((x) => (
              <button key={x.r.id} className="adm-mcard" onClick={() => setOpen(x.r.id)}>
                <div className="top">
                  <div><span className="adm-cell-title">{x.r.team_name || x.r.name}</span><span className="adm-cell-sub">{x.p.eventTitle}</span></div>
                  <Badge tone={TONE[x.state]}>{STATE_LABEL[x.state]}</Badge>
                </div>
                <div className="meta">
                  <span>{x.r.name}</span><span>{x.r.phone}</span>
                  <span>{x.p.stage === "awaiting" ? "Not paid yet" : x.p.amount != null ? rupees(x.p.amount) : "Paid"}</span>
                  <span>{fmtDate(x.r.created_at)}</span>
                </div>
                {(x.dupTxn || x.noIeeeId) && <div style={{ marginTop: 8, display: "flex", gap: 6 }}>{x.dupTxn && <Badge tone="bad">Duplicate ID</Badge>}{x.noIeeeId && <Badge tone="warn">No IEEE ID</Badge>}</div>}
              </button>
            ))}
          </div>
        </>
      )}

      {picked.size > 0 && (
        <div className="adm-bulk" role="region" aria-label="Selected registrations">
          <b>{picked.size} selected</b>
          <button className="adm-btn ok sm" onClick={() => setDialog({ kind: "bulk-approve", ids: Array.from(picked) })}>Approve</button>
          <button className="adm-btn bad sm" onClick={() => setDialog({ kind: "bulk-reject", ids: Array.from(picked) })}>Reject</button>
          <button className="adm-btn ghost sm" onClick={() => setPicked(new Set())}>Clear</button>
        </div>
      )}

      {openRow && (
        <Detail
          row={openRow}
          call={call}
          position={current >= 0 ? `${current + 1} of ${shown.length}` : ""}
          onClose={() => setOpen(null)}
          onPrev={current > 0 ? () => go(-1) : undefined}
          onNext={current >= 0 && current < shown.length - 1 ? () => go(1) : undefined}
          onApprove={() => (openRow.p.stage === "awaiting" ? setDialog({ kind: "approve-unpaid", ids: [openRow.r.id] }) : review([openRow.r.id], "approved"))}
          onReject={() => setDialog({ kind: "reject", ids: [openRow.r.id] })}
          onReset={() => review([openRow.r.id], "pending")}
          onDelete={() => setDialog({ kind: "delete", ids: [openRow.r.id] })}
          onNote={(note) => review([openRow.r.id], openRow.r.status, note)}
        />
      )}

      {dialog && (
        <Dialog
          title={
            dialog.kind === "reject" || dialog.kind === "bulk-reject" ? `Reject ${dialog.ids.length > 1 ? `${dialog.ids.length} registrations` : "this registration"}?`
            : dialog.kind === "delete" ? "Delete this registration?"
            : dialog.kind === "approve-unpaid" ? "Approve without a payment?"
            : `Approve ${dialog.ids.length} registrations?`
          }
          body={
            dialog.kind === "delete" ? "This also deletes the payment screenshot. It cannot be undone."
            : dialog.kind === "approve-unpaid" ? "This team has not submitted a payment yet. Approve only if you collected the fee another way."
            : dialog.kind === "bulk-approve" ? "Each selected team is marked approved. Check that their payments are verified."
            : undefined
          }
          confirm={dialog.kind === "delete" ? "Delete" : dialog.kind.includes("reject") ? "Reject" : "Approve"}
          danger={dialog.kind === "delete" || dialog.kind.includes("reject")}
          askReason={dialog.kind === "reject" || dialog.kind === "bulk-reject"}
          reasonLabel="Reason shown in the note (optional)"
          onCancel={() => setDialog(null)}
          onConfirm={async (reason) => {
            const d = dialog;
            setDialog(null);
            if (d.kind === "delete") await remove(d.ids);
            else if (d.kind.includes("reject")) await review(d.ids, "rejected", reason);
            else await review(d.ids, "approved");
          }}
        />
      )}
    </>
  );
}

/* ───────── detail panel ───────── */

function Detail({ row, call, position, onClose, onPrev, onNext, onApprove, onReject, onReset, onDelete, onNote }: {
  row: Row; call: Call; position: string;
  onClose: () => void; onPrev?: () => void; onNext?: () => void;
  onApprove: () => void; onReject: () => void; onReset: () => void; onDelete: () => void; onNote: (n: string) => void;
}) {
  const { r, p, state } = row;
  const toast = useToast();
  const [proof, setProof] = useState<{ url: string; at: number } | null>(null);
  const [proofErr, setProofErr] = useState("");
  const [note, setNote] = useState(p.adminNote);
  const ieeeBy = new Map(p.ieeeIds.map((i) => [i.member, i.id]));

  const loadProof = useCallback(async () => {
    setProofErr("");
    try {
      const d = await call(`proof?id=${r.id}`);
      setProof({ url: d.url, at: Date.now() });
    } catch (e) {
      setProofErr((e as Error).message);
    }
  }, [call, r.id]);

  useEffect(() => {
    setProof(null);
    setNote(p.adminNote);
    if (r.has_proof) loadProof();
  }, [r.id, r.has_proof, p.adminNote, loadProof]);

  return (
    <Drawer
      title={r.team_name || r.name}
      sub={<><Badge tone={TONE[state]}>{STATE_LABEL[state]}</Badge> <span>{p.eventTitle}{p.day ? `, day ${p.day}` : ""}</span>{position && <span> · {position}</span>}</>}
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      footer={
        <>
          <button className="adm-btn ok" disabled={r.status === "approved"} onClick={onApprove}>Approve</button>
          <button className="adm-btn bad" disabled={r.status === "rejected"} onClick={onReject}>Reject</button>
          {r.status !== "pending" && <button className="adm-btn" onClick={onReset}>Back to pending</button>}
          <button className="adm-btn ghost" style={{ marginLeft: "auto" }} onClick={onDelete}>Delete</button>
        </>
      }
    >
      {row.dupTxn && <div className="adm-flag bad">This transaction ID is used by another registration. Check both before approving.</div>}
      {row.noIeeeId && <div className="adm-flag warn">They chose the IEEE price but gave no IEEE ID.</div>}
      {p.stage === "awaiting" && <div className="adm-flag warn">The team is saved but has not submitted a payment yet.</div>}

      <section className="adm-sec">
        <h3>Team members ({p.people.length})</h3>
        <div className="adm-people">
          {p.people.map((m, i) => (
            <div className="adm-person" key={i}>
              <div>
                <b>{m.name}</b> <span style={{ color: "var(--a-muted)" }}>{m.role}</span>
                <div style={{ color: "var(--a-muted)", fontSize: 13 }}>
                  {m.usn}{m.dept && ` · ${m.dept}`}{m.year && ` · ${/^\d$/.test(m.year) ? `year ${m.year}` : m.year}`}
                </div>
                {ieeeBy.get(i + 1) && <div style={{ fontSize: 13 }}>IEEE ID <b>{ieeeBy.get(i + 1)}</b></div>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "start" }}>
                <a className="adm-btn sm" href={`tel:${m.phone}`}>Call</a>
                <a className="adm-btn sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/91${m.phone.replace(/\D/g, "").slice(-10)}`}>WhatsApp</a>
              </div>
            </div>
          ))}
        </div>
        {p.extra.length > 0 && <p style={{ margin: "10px 0 0", color: "var(--a-muted)", fontSize: 13, whiteSpace: "pre-wrap" }}>{p.extra.join("\n")}</p>}
      </section>

      <section className="adm-sec">
        <h3>Payment</h3>
        <dl className="adm-kv">
          <dt>Amount</dt><dd>{p.amount != null ? <b>{rupees(p.amount)}</b> : "-"}{p.plan && <> <Badge tone={p.plan === "ieee" ? "info" : "mute"}>{p.plan === "ieee" ? "IEEE price" : "Non-IEEE price"}</Badge></>}</dd>
          <dt>Transaction ID</dt><dd>{r.transaction_id ? <><b>{r.transaction_id}</b> <CopyButton text={r.transaction_id} /></> : "-"}</dd>
          <dt>IEEE IDs</dt><dd>{p.ieeeIds.length ? p.ieeeIds.map((i) => `Member ${i.member}: ${i.id}`).join(", ") : p.plan === "ieee" ? "None given" : "-"}</dd>
        </dl>
        {r.has_proof && (
          <div style={{ marginTop: 12 }}>
            {proofErr && <div className="adm-flag bad">{proofErr}</div>}
            {proof ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proof.url} alt="Payment screenshot" className="adm-proof" referrerPolicy="no-referrer" />
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <a className="adm-btn sm" href={proof.url} target="_blank" rel="noopener noreferrer">Open full size</a>
                  <button className="adm-btn sm" onClick={loadProof}>Refresh link</button>
                  <span style={{ color: "var(--a-faint)", fontSize: 12 }}>Link expires in 2 minutes</span>
                </div>
              </>
            ) : !proofErr ? <div className="skeleton" style={{ height: 160 }} /> : <button className="adm-btn sm" onClick={loadProof}>Try again</button>}
          </div>
        )}
        {!r.has_proof && p.stage !== "awaiting" && <p style={{ margin: "10px 0 0", color: "var(--a-muted)" }}>No screenshot uploaded.</p>}
      </section>

      <section className="adm-sec">
        <h3>Contact and record</h3>
        <dl className="adm-kv">
          <dt>Lead phone</dt><dd>{r.phone} <CopyButton text={r.phone} /></dd>
          {r.email && !r.email.endsWith("@ieee-week.invalid") && (<><dt>Email</dt><dd>{r.email}</dd></>)}
          <dt>Submitted</dt><dd>{fmtLong(r.created_at)}</dd>
          {r.reviewed_at && (<><dt>Reviewed</dt><dd>{fmtLong(r.reviewed_at)}</dd></>)}
          <dt>Registration ID</dt><dd style={{ fontSize: 12, color: "var(--a-muted)" }}>{r.id}</dd>
        </dl>
      </section>

      <section className="adm-sec">
        <h3>Admin note</h3>
        <textarea className="adm-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Only admins see this. For example: UTR checked in the bank app." />
        <div style={{ marginTop: 8 }}>
          <button className="adm-btn sm" disabled={note === p.adminNote} onClick={() => { onNote(note.trim()); toast("Note saved"); }}>Save note</button>
        </div>
      </section>
    </Drawer>
  );
}
